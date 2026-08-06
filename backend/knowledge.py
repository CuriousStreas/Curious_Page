from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


_HEADING_RE = re.compile(r"^(#{2,6})\s+(.+?)\s*$")
_ASCII_TERM_RE = re.compile(r"[a-z0-9+#.-]{2,}", re.IGNORECASE)
_CHINESE_TERM_RE = re.compile(r"[\u4e00-\u9fff]{2,}")
_UNSAFE_MARKERS = ("待补充", "？", "编辑提示")
_CHINESE_STOP_TERMS = {"介绍", "一下", "什么", "使用", "平时", "怎么", "如何", "他的", "她的", "做了"}


@dataclass(frozen=True)
class Section:
    heading: str
    content: str

    def render(self) -> str:
        return f"### {self.heading}\n{self.content}"


def _is_safe_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped or stripped.startswith("<!--") or stripped.startswith(">"):
        return False
    return not any(marker in stripped for marker in _UNSAFE_MARKERS)


def parse_sections(markdown: str) -> list[Section]:
    sections: list[Section] = []
    heading_path: dict[int, str] = {}
    current_heading = ""
    content_lines: list[str] = []
    inside_comment = False

    def flush() -> None:
        nonlocal content_lines
        if current_heading and content_lines:
            sections.append(Section(current_heading, "\n".join(content_lines)))
        content_lines = []

    for raw_line in markdown.splitlines():
        line = raw_line.strip()
        if inside_comment:
            if "-->" in line:
                inside_comment = False
            continue
        if line.startswith("<!--"):
            inside_comment = "-->" not in line
            continue

        heading_match = _HEADING_RE.match(line)
        if heading_match:
            flush()
            level = len(heading_match.group(1))
            heading_path[level] = heading_match.group(2)
            for deeper_level in tuple(heading_path):
                if deeper_level > level:
                    del heading_path[deeper_level]
            current_heading = " / ".join(
                heading_path[path_level]
                for path_level in sorted(heading_path)
                if path_level >= 2
            )
            continue

        if current_heading and _is_safe_line(line):
            content_lines.append(line)

    flush()
    return sections


def load_sections(path: str | Path) -> list[Section]:
    return parse_sections(Path(path).read_text(encoding="utf-8"))


def _terms(text: str) -> set[str]:
    normalized = text.casefold().replace("gmtool", "gm 工具")
    terms = set(_ASCII_TERM_RE.findall(normalized))
    for phrase in _CHINESE_TERM_RE.findall(normalized):
        terms.update(
            phrase[index : index + 2]
            for index in range(len(phrase) - 1)
            if phrase[index : index + 2] not in _CHINESE_STOP_TERMS
        )
    return terms


def _term_matches(term: str, text: str) -> bool:
    if _CHINESE_TERM_RE.fullmatch(term):
        return term in text
    return term in _ASCII_TERM_RE.findall(text.replace("gmtool", "gm 工具"))


def retrieve(question: str, sections: Iterable[Section], limit: int = 3) -> list[str]:
    query_terms = _terms(question)
    if not query_terms:
        return []

    ranked: list[tuple[int, int, Section]] = []
    for index, section in enumerate(sections):
        heading = section.heading.casefold()
        content = section.content.casefold()
        heading_score = sum(3 for term in query_terms if _term_matches(term, heading))
        content_score = sum(1 for term in query_terms if _term_matches(term, content))
        score = heading_score + content_score
        if score > 0:
            ranked.append((score, -index, section))

    ranked.sort(reverse=True)
    return [section.render() for _, _, section in ranked[:limit]]