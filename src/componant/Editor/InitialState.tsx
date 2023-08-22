import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import React from "react"

export function RestoreFromLocalStoragePlugin({ serializedEditorState }: any) {
    const [editor] = useLexicalComposerContext()
    const [isFirstRender, setIsFirstRender] = React.useState(true)

    React.useEffect(() => {
        editor?.update(() => {
            // Prepopulate
            if (isFirstRender) {
                setIsFirstRender(false)

                if (serializedEditorState) {
                    const initialEditorState = editor.parseEditorState(serializedEditorState)
                    editor.setEditorState(initialEditorState)
                }
            }
        });

    }, [isFirstRender, serializedEditorState, editor])


    // TODO: add ignoreSelectionChange
    return null
}