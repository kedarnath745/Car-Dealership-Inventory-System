#!/usr/bin/env python3
"""
Exports a Claude Code session transcript (JSONL) to PROMPTS.md, word for word.

Nothing is summarised or rewritten: user messages, the assistant's replies, every
question the assistant asked with the answers chosen, and the full prompts given to
sub-agents are copied verbatim. Other tool calls are listed as one line each
(tool name + its own description) so the log stays readable. Internal context the
harness adds (system reminders, tool listings, image captions) is not part of the
conversation and is left out.

Usage: python3 scripts/export_prompts.py <session.jsonl> > PROMPTS.md
"""
import json
import sys

HARNESS_PREFIXES = ('<task-notification>', '[Image:', 'Another Claude session sent a message')


def text_of(content):
    if isinstance(content, str):
        return content
    return '\n'.join(b.get('text', '') for b in content if isinstance(b, dict) and b.get('type') == 'text')


def quote(text):
    return '\n'.join('> ' + line if line else '>' for line in text.strip().splitlines())


def main(path):
    out = ['# PROMPTS.md: raw AI chat log', '',
           'Exported word for word from the Claude Code session transcript with '
           '`scripts/export_prompts.py`. No AI-generated summaries. Tool calls other than '
           'questions and sub-agent prompts are listed by name and description only.', '']
    ask_ids = set()
    last_tool = None
    for line in open(path, encoding='utf-8'):
        entry = json.loads(line)
        kind = entry.get('type')
        message = entry.get('message') or {}
        content = message.get('content')

        if kind == 'attachment':
            attachment = entry.get('attachment') or {}
            prompt = attachment.get('prompt', '')
            if attachment.get('type') == 'queued_command' and not prompt.startswith(('<task-notification>', '<agent-message')):
                out += ['## User (sent while the assistant was working)', '', prompt.strip(), '']
            continue

        if kind == 'user':
            if isinstance(content, str) or any(b.get('type') == 'text' for b in content or []):
                text = text_of(content).strip()
                if last_tool == 'Skill' and text:
                    # Instructions a skill loads into the conversation, not typed by the user.
                    first_line = text.splitlines()[0][:100]
                    out += ['', f'- _Skill instructions loaded (from the skill, not the user): "{first_line}…"_', '']
                elif text.startswith('Another Claude session sent a message'):
                    out += ['## Sub-agent report (AI output, delivered to the assistant)', '', quote(text), '']
                elif text and not text.startswith(HARNESS_PREFIXES):
                    out += ['## User', '', text, '']
                if text:
                    last_tool = None
            for block in content if isinstance(content, list) else []:
                if block.get('type') == 'tool_result' and block.get('tool_use_id') in ask_ids:
                    out += ['**Answers chosen by the user:**', '', quote(text_of(block.get('content') or '')), '']
            continue

        if kind == 'assistant' and isinstance(content, list):
            for block in content:
                if block.get('type') == 'text' and block.get('text', '').strip():
                    out += ['## Assistant', '', block['text'].strip(), '']
                elif block.get('type') == 'tool_use':
                    name, args = block.get('name'), block.get('input') or {}
                    last_tool = name
                    if name == 'AskUserQuestion':
                        ask_ids.add(block.get('id'))
                        out += ['**Assistant asked:**', '']
                        for q in args.get('questions', []):
                            out.append(f"- **{q.get('question')}**")
                            for option in q.get('options', []):
                                out.append(f"  - {option.get('label')}: {option.get('description')}")
                        out.append('')
                    elif name == 'Agent':
                        out += [f"**Prompt sent to a sub-agent ({args.get('description', '')}):**", '',
                                quote(args.get('prompt', '')), '']
                    else:
                        detail = args.get('description') or args.get('skill') or args.get('file_path') or ''
                        out.append(f'- _Tool: {name}_' + (f': {detail}' if detail else ''))
            continue
    # A blank line before every heading keeps the Markdown well formed.
    text = '\n'.join(out).replace('\n## ', '\n\n## ').replace('\n**', '\n\n**')
    while '\n\n\n' in text:
        text = text.replace('\n\n\n', '\n\n')
    print(text)


if __name__ == '__main__':
    main(sys.argv[1])
