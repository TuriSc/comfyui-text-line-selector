import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

app.registerExtension({
    name: "comfyui.line_selector",
    
    async setup() {
        function updateLineSelectorNodes() {
            const nodes = app.graph._nodes || [];
            
            for (const node of nodes) {
                if (node.type === "TextLineSelectorNode" || node.comfyClass === "TextLineSelectorNode") {
                    updateNodeWidgets(node);
                }
            }
        }
        
        const originalQueuePrompt = app.queuePrompt;
        if (originalQueuePrompt) {
            app.queuePrompt = async function(...args) {
                const result = await originalQueuePrompt.apply(this, args);
                
                // Wait for ComfyUI to fully process the queue before updating widgets
                await new Promise(resolve => setTimeout(resolve, 10));
                updateLineSelectorNodes();
                
                return result;
            };
        }
    },
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "TextLineSelectorNode") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                onNodeCreated?.apply(this, arguments);
            };
        }
    }
});

function updateNodeWidgets(node) {
    try {
        if (!node.widgets) {
            return;
        }
        
        const controlWidget = node.widgets.find(w => w.name === "control_after_generate");
        const lineIndexWidget = node.widgets.find(w => w.name === "line_index");
        const multilineTextWidget = node.widgets.find(w => w.name === "multiline_text");
        
        if (!controlWidget || !lineIndexWidget || !multilineTextWidget) {
            return;
        }
        
        const controlValue = controlWidget.value;
        const currentIndex = lineIndexWidget.value;
        const text = multilineTextWidget.value;
        
        const lines = text.split('\n').filter(line => line !== undefined);
        
        if (lines.length > 0) {
            const arrayIndex = Math.max(0, currentIndex - 1) % lines.length;
            let updatedArrayIndex = arrayIndex;
            
            switch (controlValue) {
                case "increment":
                    updatedArrayIndex = (arrayIndex + 1) % lines.length;
                    break;
                case "decrement":
                    updatedArrayIndex = (arrayIndex - 1 + lines.length) % lines.length;
                    break;
                case "randomize":
                    if (lines.length > 1) {
                        const availableIndices = [];
                        for (let i = 0; i < lines.length; i++) {
                            if (i !== arrayIndex) {
                                availableIndices.push(i);
                            }
                        }
                        updatedArrayIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                    } else {
                        updatedArrayIndex = 0;
                    }
                    break;
            }
            
            const newIndex = updatedArrayIndex + 1;
            
            if (newIndex !== currentIndex) {
                lineIndexWidget.value = newIndex;
                
                if (lineIndexWidget.callback) {
                    lineIndexWidget.callback(newIndex);
                }
                
                if (app.graph && app.graph.setDirtyCanvas) {
                    app.graph.setDirtyCanvas(true);
                }
            }
        }
        
    } catch (error) {
        console.error("Line Selector error:", error);
    }
}