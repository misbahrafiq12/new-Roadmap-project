"use client";
import React, { useRef, useCallback, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { DnDProvider, useDnD } from '../components/DnDContext';
import { createNode, updateNode, deleteNode } from "../service/api";

const initialNodes = [];
let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const router = useRouter(); 
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editValue, setEditValue] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const onNodeClick = (e, node) => {
    setEditValue(node.data.label);
    setSelectedNodeId(node.id);
  };

  const handleChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleEdit = async () => {
    try {
      const updatedNodes = nodes.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: editValue,
            },
          };
        }
        return node;
      });

      setNodes(updatedNodes);
      await updateNode({ id: selectedNodeId, data: { label: editValue } });
      setEditValue('');
      setSelectedNodeId(null);
    } catch (error) {
      console.error('Error updating node:', error);
    }
  };

 
 const handleDelete = () => {
  const updatedNodes = nodes.filter((node) => node.id !== selectedNodeId);
  setNodes(updatedNodes);
  setEditValue('');
  setSelectedNodeId(null);
};


  const handleSave = async () => {
    const roadmapData = { 
      nodes: nodes,
      edges: edges
    };

    localStorage.setItem('roadmap', JSON.stringify(roadmapData));
    
    try {
      await createNode(roadmapData);
      console.log('Roadmap Data:', roadmapData);
      router.push('/render'); 
    } catch (error) {
      console.error('Error saving nodes:', error);
    }
  };

  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!type) {
        return;
      }
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      if (position.x === undefined || position.y === undefined) {
        console.error('Position is undefined');
        return;
      }
      const newNode = {
        id: getId(),
        type,
        position,
        data: { 
          label: `${type} node`, 
          folder: 'your-folder-name' 
        },
        style: { 
          background: 'lightgrey', 
          color: 'black', 
          border: '1px solid lightgrey', 
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type, setNodes]
  );

  return (
    <>
      <div className="flex items-center justify-center h-20 ">
        <h1 className="text-4xl font-bold w-full text-center">Admin Dashboard</h1>
      </div>
      <div className="dndflow md:flex flex-col md:flex-row border-blue-900" style={{ height: '100vh', width: '100%' }}>
        <Sidebar>
          <div className="inline-flex md:inline-block">
            <label className="md:block hidden">Label</label>
            <Input type="text" value={editValue} onChange={handleChange} className="md:mt-3 md:w-full w-56" />
            <Button className='btn bg-blue-400 text-white md:mt-3 p-2 md:ml-0 ml-3' onClick={handleEdit} disabled={!selectedNodeId}>
              Update
            </Button>
            <Button className='btn bg-red-400 text-white md:mt-3 p-2 ml-3' onClick={handleDelete} disabled={!selectedNodeId}>
              Delete
            </Button>
            <Button className='btn bg-green-400 text-white md:mt-3 p-2 ml-3' onClick={handleSave}>
              Save
            </Button>
          </div>
        </Sidebar>
        <div
          className="reactflow-wrapper flex-1"
          ref={reactFlowWrapper}
          style={{ height: '100%' }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </>
  );
};
DnDFlow.displayName = "DnDFlow";
const admin= () => (
  <ReactFlowProvider>
    <DnDProvider>
      <DnDFlow />
    </DnDProvider>
  </ReactFlowProvider>
);
admin.displayName = "admin";
export default admin;
