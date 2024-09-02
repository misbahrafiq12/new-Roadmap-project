import React from 'react';
import { useDnD } from './DnDContext';
import { Button } from "@/components/ui/button";


const Sidebar = ({ children }) => {
  const [_, setType] = useDnD();

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="md:flex md:flex-col md:space-y-4 space-x-4 md:p-4 bg-gray-100 rounded-lg shadow-md w-full md:max-w-xs md:mx-auto md:h-auto min-h-[150px] overflow-hidden overflow-x-hidden ">
      <div className="description text-lg font-semibold text-gray-700 mb-4 text-center sm:text-left">
        You can drag these nodes to the pane on the right.
      </div>
      <Button 
        className="dndnode input bg-gray-300 text-gray-800 hover:bg-gray-400 transition duration-200 ease-in-out p-4"
        onDragStart={(event) => onDragStart(event, 'input')} 
        draggable
      >
        Input Node
      </Button>
      <Button 
        className="dndnode bg-gray-300 text-gray-800 hover:bg-gray-400 transition duration-200 ease-in-out p-4"
        onDragStart={(event) => onDragStart(event, 'default')} 
        draggable
      >
        Default Node
      </Button>
      <Button 
        className="dndnode output bg-green-500 text-white hover:bg-green-600 transition duration-200 ease-in-out p-4"
        onDragStart={(event) => onDragStart(event, 'output')} 
        draggable
      >
        Output Node
      </Button>
      <div className="mt-4">{children}</div>
    </aside>
  );
};

export default Sidebar;
