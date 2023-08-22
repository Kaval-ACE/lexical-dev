import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
// import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CAN_USE_DOM } from './shared/src/canUseDOM';

import { createWebsocketProvider } from './collaboration';
import { useSettings } from './context/SettingsContext';
import { useSharedHistoryContext } from './context/SharedHistoryContext';
import TableCellNodes from './nodes/TableCellNodes';
import ActionsPlugin from './plugins/ActionsPlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import CommentPlugin from './plugins/CommentPlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
// import ContextMenuPlugin from './plugins/ContextMenuPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
// import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import ExcalidrawPlugin from './plugins/ExcalidrawPlugin';
import FigmaPlugin from './plugins/FigmaPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import InlineImagePlugin from './plugins/InlineImagePlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import { MaxLengthPlugin } from './plugins/MaxLengthPlugin';
// import MentionsPlugin from './plugins/MentionsPlugin';
import PollPlugin from './plugins/PollPlugin';
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
// import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
// import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import { TablePlugin as NewTablePlugin } from './plugins/TablePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
// import TreeViewPlugin from './plugins/TreeViewPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import { RestoreFromLocalStoragePlugin } from './InitialState';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, $getSelection, EditorState } from 'lexical';
import { isEqual } from 'lodash';

const skipCollaborationInit =
    // @ts-ignore
    window.parent != null && window.parent.frames.right === window;

export default function Editor(): JSX.Element {
    const { historyState } = useSharedHistoryContext();
    const [jsonObj, setJsonObj] = useState({
        "root": {
            "children": [
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 0,
                            "mode": "normal",
                            "style": "",
                            "text": "aaa",
                            "type": "text",
                            "version": 1
                        }
                    ],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                },
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 0,
                            "mode": "normal",
                            "style": "",
                            "text": "bbb",
                            "type": "text",
                            "version": 1
                        }
                    ],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "root",
            "version": 1
        }
    })
    const [allowOnhange, setAllowOnhange] = useState(true)
    const {
        settings: {
            isCollab,
            isAutocomplete,
            isMaxLength,
            isCharLimit,
            isCharLimitUtf8,
            isRichText,
            showTreeView,
            showTableOfContents,
            shouldUseLexicalContextMenu,
            tableCellMerge,
            tableCellBackgroundColor,
        },
    } = useSettings();

    const isEditable = useLexicalEditable();
    const text = isCollab
        ? 'Enter some collaborative rich text...'
        : isRichText
            ? 'Enter some rich text...'
            : 'Enter some plain text...';
    const placeholder = <Placeholder>{text}</Placeholder>;
    const [floatingAnchorElem, setFloatingAnchorElem] =
        useState<HTMLDivElement | null>(null);
    const [isSmallWidthViewport, setIsSmallWidthViewport] =
        useState<boolean>(false);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };

    const editorRef = React.useRef<any>()

    // const obj = {
    //     "root": {
    //         "children": [
    //             {
    //                 "children": [
    //                     {
    //                         "detail": 0,
    //                         "format": 0,
    //                         "mode": "normal",
    //                         "style": "border:1px solid red",
    //                         "text": "aaa",
    //                         "type": "text",
    //                         "version": 1
    //                     }
    //                 ],
    //                 "direction": "ltr",
    //                 "format": "",
    //                 "indent": 0,
    //                 "type": "paragraph",
    //                 "version": 1
    //             },
    //             {
    //                 "children": [
    //                     {
    //                         "detail": 0,
    //                         "format": 0,
    //                         "mode": "normal",
    //                         "style": "",
    //                         "text": "bbb",
    //                         "type": "text",
    //                         "version": 1
    //                     }
    //                 ],
    //                 "direction": "ltr",
    //                 "format": "",
    //                 "indent": 0,
    //                 "type": "paragraph",
    //                 "version": 1
    //             }
    //         ],
    //         "direction": "ltr",
    //         "format": "",
    //         "indent": 0,
    //         "type": "root",
    //         "version": 1
    //     }
    // }

    const cellEditorConfig = {
        namespace: 'Playground',
        nodes: [...TableCellNodes],
        onError: (error: Error) => {
            throw error;
        },
        theme: PlaygroundEditorTheme,
    };

    // const cellEditorConfig = {
    //   namespace: 'MyEditor',
    //   theme,
    //   onError,
    //   nodes: [
    //     HeadingNode
    //   ]
    // };

    useEffect(() => {
        const updateViewPortWidth = () => {
            const isNextSmallWidthViewport =
                CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

            if (isNextSmallWidthViewport !== isSmallWidthViewport) {
                setIsSmallWidthViewport(isNextSmallWidthViewport);
            }
        };
        updateViewPortWidth();
        window.addEventListener('resize', updateViewPortWidth);

        return () => {
            window.removeEventListener('resize', updateViewPortWidth);
        };
    }, [isSmallWidthViewport]);

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    function setStyleValue(node: any) {
        // Check if the node is an object
        if (typeof node === 'object' && node !== null) {
            // If the current node has a 'style' key, set its value to 123
            if (node.hasOwnProperty('style')) {
                node.style = "border:1px solid red";
            }

            // Iterate through the properties of the node
            for (let key in node) {
                if (node.hasOwnProperty(key)) {
                    // Recursively set the style value for each property
                    setStyleValue(node[key]);
                }
            }
        }
        return node;
    }

    function onChange(editorState: any) {
        let update = setStyleValue(JSON.parse(JSON.stringify(editorState)))
        if (isEqual(jsonObj, update)) {
            return
        }
        setJsonObj(update)
        editorRef?.current?.update(() => {
            const initialEditorState = editorRef?.current?.parseEditorState(jsonObj)
            editorRef?.current?.setEditorState(initialEditorState)
            console.log("jsonObj", jsonObj)
        })
        // console.log("editorRef", editorRef)
        // editorRef?.current?.update(() => {
        //     // const initialEditorState = editorRef?.current?.parseEditorState(update)
        //     // editorRef?.current?.setEditorState(initialEditorState)
        //     console.log("update", update)
        // })
        // console.log("editor", JSON.parse(JSON.stringify(editor)))
        // setJsonObj(update)
        // debugger;
        // const [editor] = useLexicalComposerContext()
        // let nn1 = JSON.parse(JSON.stringify(update))
        // debugger;
        // console.log("editorState", JSON.parse(JSON.stringify(editorState)))
        // debugger;

        // editorState.read(() => {
        //     // Read the contents of the EditorState here.
        //     const root = $getRoot();
        //     const selection = $getSelection();

        //     console.log(root, selection);
        // });
    }
    // useEffect(() => {


    // }, [jsonObj])

    const EditorCapturePlugin = React.forwardRef((props: any, ref: any) => {
        console.log("88888888888")
        const [editor] = useLexicalComposerContext();
        useEffect(() => {
            ref.current = editor;
            return () => {
                ref.current = null;
            };
        }, [editor, ref]);

        return null;
    });

    // function MyOnChangePlugin(props: { onChange: (editorState: EditorState) => void }): null {
    //     const [editor] = useLexicalComposerContext()
    //     const { onChange } = props
    //     useEffect(() => {
    //         let nn = setStyleValue(JSON.parse(JSON.stringify(editor)))
    //         debugger;
    //         setJsonObj(nn)
    //         // return editor.registerUpdateListener(({ editorState }) => {  
    //         // });
    //     }, [onChange])
    //     console.log("editor", JSON.parse(JSON.stringify(editor)))
    //     return null;
    // }


    return (
        <>
            {isRichText && <ToolbarPlugin />}
            <div className={`editor-container ${showTreeView ? 'tree-view' : ''} ${!isRichText ? 'plain-text' : ''}`}>

                {isMaxLength && <MaxLengthPlugin maxLength={30} />}
                <DragDropPaste />
                <AutoFocusPlugin />
                <ClearEditorPlugin />
                <ComponentPickerPlugin />
                <AutoEmbedPlugin />
                <EmojisPlugin />
                <HashtagPlugin />
                <KeywordsPlugin />
                <SpeechToTextPlugin />
                <AutoLinkPlugin />
                <RestoreFromLocalStoragePlugin serializedEditorState={JSON.stringify(jsonObj)} />
                <CommentPlugin providerFactory={isCollab ? createWebsocketProvider : undefined} />
                {isRichText ? (
                    <>
                        {isCollab ? (
                            //   <CollaborationPlugin
                            //     id="main"
                            //     providerFactory={createWebsocketProvider}
                            //     shouldBootstrap={!skipCollaborationInit}
                            //   />
                            <></>
                        ) : (
                            <HistoryPlugin externalHistoryState={historyState} />
                        )}
                        {/* <MyOnChangePlugin onChange={onChange} /> */}

                        <OnChangePlugin onChange={onChange} />
                        <EditorCapturePlugin ref={editorRef} />
                        <RichTextPlugin
                            contentEditable={
                                <div className="editor-scroller">
                                    <div className="editor" ref={onRef}>
                                        <ContentEditable />
                                    </div>
                                </div>
                            }
                            placeholder={placeholder}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <MarkdownShortcutPlugin />
                        <CodeHighlightPlugin />
                        <ListPlugin />
                        <CheckListPlugin />
                        <ListMaxIndentLevelPlugin maxDepth={7} />
                        {/* <TablePlugin
                        // hasCellMerge={tableCellMerge}
                        // hasCellBackgroundColor={tableCellBackgroundColor}
                        /> */}
                        <TableCellResizer />
                        <NewTablePlugin cellEditorConfig={cellEditorConfig}>
                            <AutoFocusPlugin />
                            <RichTextPlugin
                                contentEditable={
                                    <ContentEditable className="TableNode__contentEditable" />
                                }
                                placeholder={null}
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            <HistoryPlugin />
                            <ImagesPlugin captionsEnabled={false} />
                            <LinkPlugin />
                            <FloatingTextFormatToolbarPlugin />
                        </NewTablePlugin>
                        <ImagesPlugin />
                        <InlineImagePlugin />
                        <LinkPlugin />
                        <PollPlugin />
                        <TwitterPlugin />
                        <YouTubePlugin />
                        <FigmaPlugin />
                        <HorizontalRulePlugin />
                        <EquationsPlugin />
                        <ExcalidrawPlugin />
                        <TabFocusPlugin />
                        <TabIndentationPlugin />
                        <CollapsiblePlugin />

                        {floatingAnchorElem && !isSmallWidthViewport && (
                            <>
                                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                                <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                                <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
                                <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
                            </>
                        )}
                    </>
                ) : (
                    <>

                    </>
                )}
                {(isCharLimit || isCharLimitUtf8) && (
                    <CharacterLimitPlugin
                        charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
                        maxLength={5}
                    />
                )}
                {isAutocomplete && <AutocompletePlugin />}
                <ActionsPlugin isRichText={isRichText} />

            </div>
        </>
    );
}
