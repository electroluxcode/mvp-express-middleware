

import { useEffect, useState } from "react";
import { EditorKit } from 'kk-adapt-app';
import { Editor, EditorContainer } from 'kk-adapt-app';
import { ShareDBPlugin } from 'kk-adapt-app';
import "./style.css"
import {TrailingBlockPlugin} from 'kk-adapt-app'
import { KEYS, NormalizeTypesPlugin } from 'kk-adapt-app';
import { Plate, usePlateEditor } from 'kk-adapt-app';
const defaultValues =   [{
  children: [{ text: '欢迎来到 Plate 演示平台！' }],
  type: 'h1',
}]
export default function App() {
  const [isOtReady, setIsOtReady] = useState(false);
  const [socket, setSocket] = useState<any>(null);  

  const editor = usePlateEditor(
    {
      override: {
        enabled: {
          // [KEYS.indent]: id !== 'listClassic',
          // [KEYS.list]: id !== 'listClassic',
          [KEYS.listClassic]: true,
          sharedb: true, // 启用 sharedb 插件
        },
      },
      plugins: [
        ...EditorKit,
        TrailingBlockPlugin.configure({
          options: {
            type: 'p', // 段落块
            filter: (node: any) => {
              // 当 listStyleType 是 "disc" 时触发
              const shouldTrigger = node?.[0]?.listStyleType === 'disc' || node?.[0]?.listStyleType === 'decimal';
              return shouldTrigger;
            }
          },
        }),

        // sharedb 协作编辑插件 - 简化配置
        ShareDBPlugin.configure({
          enabled: true,
          options: {
            debug: true,
            enablePresence: false,
            onConnect: () => {
              console.log('✅ sharedb: Connected to ShareDB server');
              console.log('🎉 sharedb: Ready for collaborative editing!');
              setIsOtReady(true);
            },
            onDisconnect: () => {
              console.log('❌ sharedb: Disconnected from ShareDB server');
              console.log('💡 sharedb: Make sure ShareDB server is running on ws://localhost:8111');
              setIsOtReady(false);
            },
            onError: (error: any) => {
              console.error('🚨 sharedb Error:', error);
              console.error('🔍 sharedb Error details:', {
                code: error?.code,
                message: error?.message,
                stack: error?.stack,
                type: error?.type
              });
              setIsOtReady(false);
            },
            onStatusChange: (status: any) => {
              console.log('🔄 sharedb Status changed:', status);
              
              // 添加状态特定的提示
              switch(status) {
                case 'connected': {
                  console.log('🌟 sharedb: Successfully connected to ShareDB!');
                  break;
                }
                case 'connecting': {
                  console.log('📡 sharedb: Attempting to connect to ws://localhost:8111...');
                  break;
                }
                case 'disconnected': {
                  console.log('⚠️ sharedb: Connection lost. Check if ShareDB server is running.');
                  break;
                }
                case 'error': {
                  console.log('💥 sharedb: Connection error occurred.');
                  break;
                }
              }
            },
          },
        }),


      ],
      // 重要：使用 sharedb 时需跳过默认初始化
      
      skipInitialization: true,
    },
    []
  );
  useEffect(() => {
    console.log('editor-zptest', editor.api);
   init()
  }, [editor]);
  const init = async () => {
    if (!editor?.api?.sharedb) {
      console.error("❌ PlaygroundDemo: Editor sharedb API not available");
      return;
    }
    await (editor.api.sharedb as any).init({
      id: '814862095570853888', // 文档 ID
      autoConnect: true, // 自动连接
      collection: 'documents', // 文档集合
      reconnection: {
        enabled: true,
        interval: 3000,
        maxRetries: 5,
      },
      url: 'wss://teamshare-document-service.t.cn-shenzhen.aliyun.kkgroup.work/ws?authorization=eyJhbGciOiJIUzI1NiIsInR5cGUiOiJKV1QifQ==.eyJpc3MiOjY2MTk5MjczNzcyMzMyMjM2OSwiZXhwIjoxNzU3NTk5NzEyLCJzdWIiOiJKc29uIFdlYiBUb2tlbiIsImF1ZCI6bnVsbCwibmJmIjpudWxsLCJpYXQiOjE3NTUwMDc3MTIsImp0aSI6ODEzODk1MDk2NjQyOTI4NjQyLCJjdXMiOnsiZGV2aWNlX2lkIjoiZTAzZDhlM2IyMDE4NWJjOGU0Y2U2ZjdhYzY3NGRkOGM5ZmE0MmU1ZjEwMTFiNDJhZjVhMWVkMjhmOTM0MzU2OSIsInRlbmFudF9pZCI6MTgwNzA3MDAwNzUwNzd9fQ==.4b718417bfab65fba157f2f8f2e6d5e84f3ae5d8a23bf4a84f8f4240823eb7e5&organization_code=DT001', // ShareDB 服务器地址
      value: defaultValues, // 初始值（仅在文档为空时使用）
    });

    const options = editor.api.sharedb.getCtx().getOptions()
    console.log('options-zptest', options);
  }
  return (
    <>
   <div className="w-full h-full flex">
   <Plate editor={editor}>
      
      <EditorContainer >
     
        <Editor
          variant="demo"
          className="pb-[20vh]"
          placeholder="Type something..."
          spellCheck={false}
        />
      </EditorContainer>
    </Plate>
   </div>
    </>
  );
}