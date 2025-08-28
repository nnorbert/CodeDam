import { useEffect } from "react";
import { NumberVarWidget } from "../../libraries/CodeBuilder/widgets/variables/NumberVarWidget";

export default function Playground() {


  
  useEffect(()=>{
    
    const nr1 = new NumberVarWidget('a');
    console.log(nr1.name, nr1.value);
    
    const nr2 = new NumberVarWidget('b', 10);
    console.log(nr2.name, nr2.value);

  },[]);



  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Playground 🦫</h1>
      <p className="text-lg">
        ...
      </p>
    </div>
  );
}
