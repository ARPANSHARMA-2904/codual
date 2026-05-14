import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/theme/dracula.css'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'
import ACTIONS from '../../../shared/Actions.Frontend'

const Editor = ({ socketRef, roomId }) => {
  const editorRef = useRef(null);
  const cmInstance = useRef(null);

  //Sending the code to the server



  useEffect(() => {
    if (cmInstance.current) return; // 

    cmInstance.current = Codemirror.fromTextArea(editorRef.current, {
      mode: { name: 'javascript', json: true },
      theme: 'dracula',
      lineNumbers: true,
      autoCloseTags: true,
      autoCloseBrackets: true

    });

    cmInstance.current.setSize("100%", "100%");

    cmInstance.current.on('change', (instance, changes) => {
      // console.log('changes', changes);
      // console.log('instance', instance);
      const { origin } = changes;
      const code = instance.getValue();
      // console.log(code);
      if (origin !== 'setValue') {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code,
        })
      }
    })

  }, []);

  useEffect(() => {

    if (!socketRef.current) return;

    const handleCodeChange = ({ code }) => {

      if (code != null) {
        cmInstance.current.setValue(code);
      }

    };

    socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);


    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
    };

  }, [socketRef.current]);

  return <textarea ref={editorRef}></textarea>;
};

export default Editor;