"""
ComfyUI Custom Node: Text Line Selector
A node for extracting individual lines from multiline text input for batch processing.
"""

from .text_line_selector import TextLineSelectorNode

NODE_CLASS_MAPPINGS = {
    "TextLineSelectorNode": TextLineSelectorNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "TextLineSelectorNode": "Text Line Selector",
}

WEB_DIRECTORY = "./web/js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
