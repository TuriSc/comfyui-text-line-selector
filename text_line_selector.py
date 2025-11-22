import random

class TextLineSelectorNode:
    """
    A ComfyUI custom node that extracts a single line from multiline text input
    based on an index, with control over how the index changes after generation.
    Useful for batch processing workflows where each line represents a separate prompt or data entry.
    """
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "multiline_text": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "tooltip": "Enter multiple lines of text, each line will be processed individually"
                }),
                "line_index": ("INT", {
                    "default": 1,
                    "min": 1,
                    "max": 999999,
                    "step": 1,
                    "tooltip": "Line number to extract (1 = first line, 2 = second line, etc.)"
                }),
                "control_after_generate": (["fixed", "increment", "decrement", "randomize"], {
                    "default": "increment",
                    "tooltip": "How to modify the index after generation: fixed (no change), increment (next line), decrement (previous line), or randomize (random line)"
                })
            }
        }
    
    RETURN_TYPES = ("STRING", "INT")
    RETURN_NAMES = ("selected_line", "index")
    FUNCTION = "select_line"
    CATEGORY = "utils"
    
    def select_line(self, multiline_text, line_index, control_after_generate):
        """
        Extract a single line from multiline text and update the index based on control setting.
        
        Args:
            multiline_text (str): The input text containing multiple lines
            line_index (int): Line number (1 = first line, 2 = second line, etc.)
            control_after_generate (str): How to update the index after extraction
            
        Returns:
            tuple: (selected_line, current_index_used)
        """
        # Since ComfyUI caches the result, control_after_generate doesn't work for batches
        # The node is only called once, not once per batch item
        # We can only return the single line for the current index
        
        # Split the text into lines, preserving empty lines
        lines = multiline_text.split('\n')
        
        # Handle empty input
        if not lines or (len(lines) == 1 and lines[0] == ""):
            return "", line_index
        
        # Convert 1-based UI index to 0-based array index
        array_index = max(0, line_index - 1)
        
        # Ensure the index is within valid bounds
        if len(lines) > 0:
            array_index = array_index % len(lines)
        else:
            array_index = 0
        
        # Extract the selected line using the 0-based array index
        selected_line = lines[array_index] if array_index < len(lines) else ""
        
        return (selected_line, line_index)