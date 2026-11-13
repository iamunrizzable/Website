"""
Fine-tune Llama-3.2-1B-Instruct on Hallie's dataset in a FREE Google Colab T4.

How to use
1. Colab -> Runtime -> Change runtime type -> T4 GPU.
2. Upload data/hallie-finetune.jsonl to the Colab files panel (left side).
3. Paste this whole file into one cell and run it.
4. When asked, type your Hugging Face WRITE token. It is typed into the Colab
   prompt only. It is never saved in this file or in the repo.

Colab installs below; if a version conflict appears, restart the runtime and
run the cell again.
"""
import subprocess, sys

subprocess.check_call([sys.executable, "-m", "pip", "install", "-q",
                       "unsloth", "trl", "datasets", "huggingface_hub"])

import os
from getpass import getpass

from datasets import load_dataset
from unsloth import FastLanguageModel
from unsloth.chat_templates import get_chat_template, train_on_responses_only
from trl import SFTConfig, SFTTrainer

DATA_FILE = "hallie-finetune.jsonl"      # uploaded to Colab
BASE_MODEL = "unsloth/Llama-3.2-1B-Instruct"
HF_REPO = input("Hugging Face repo to publish to (e.g. yourname/hallie-1b): ").strip()
HF_TOKEN = getpass("Hugging Face WRITE token: ").strip()
MAX_SEQ = 2048

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=BASE_MODEL,
    max_seq_length=MAX_SEQ,
    load_in_4bit=True,
    dtype=None,
)

model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
    use_gradient_checkpointing="unsloth",
    random_state=3407,
)

tokenizer = get_chat_template(tokenizer, chat_template="llama-3.2")

dataset = load_dataset("json", data_files=DATA_FILE, split="train")


def to_text(batch):
    texts = [
        tokenizer.apply_chat_template(m, tokenize=False, add_generation_prompt=False)
        for m in batch["messages"]
    ]
    return {"text": texts}


dataset = dataset.map(to_text, batched=True)

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    args=SFTConfig(
        dataset_text_field="text",
        max_seq_length=MAX_SEQ,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        num_train_epochs=3,
        learning_rate=2e-4,
        warmup_steps=5,
        logging_steps=1,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="linear",
        seed=3407,
        output_dir="outputs",
        report_to="none",
        fp16=True,       # T4 has no bfloat16
        bf16=False,
    ),
)

# Learn only from Hallie's replies, not from the system/user text.
trainer = train_on_responses_only(
    trainer,
    instruction_part="<|start_header_id|>user<|end_header_id|>\n\n",
    response_part="<|start_header_id|>assistant<|end_header_id|>\n\n",
)

trainer.train()

# Quick check that she answers in character.
FastLanguageModel.for_inference(model)
probe = tokenizer.apply_chat_template(
    [{"role": "system", "content": "You are Hallie, the AI assistant for TJB Management Inc."},
     {"role": "user", "content": "Who are you?"}],
    add_generation_prompt=True, return_tensors="pt").to("cuda")
out = model.generate(input_ids=probe, max_new_tokens=80, do_sample=False)
print(tokenizer.decode(out[0][probe.shape[1]:], skip_special_tokens=True))

# Publish the merged 16-bit weights to Hugging Face.
model.push_to_hub_merged(HF_REPO, tokenizer, save_method="merged_16bit", token=HF_TOKEN)
print("Done: https://huggingface.co/" + HF_REPO)
