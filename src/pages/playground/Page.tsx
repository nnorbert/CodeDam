import { useEffect } from "react";
import { NumberVarWidget } from "../../libraries/CodeBuilder/widgets/variables/NumberVarWidget";
import { AdditionWidget } from "../../libraries/CodeBuilder/widgets/operations/Addition";
import { RemainderWidget } from "../../libraries/CodeBuilder/widgets/operations/Remainder";
import { DivisionWidget } from "../../libraries/CodeBuilder/widgets/operations/Division";
import { BooleanVarWidget } from "../../libraries/CodeBuilder/widgets/variables/BooleanVarWidget";

export default function Playground() {


  
  useEffect(()=>{
    
    const nr1 = new NumberVarWidget('a', 8);
    console.log(nr1.name, nr1.value);
    
    const nr2 = new NumberVarWidget('b', 3);
    console.log(nr2.name, nr2.value);

    const result = new NumberVarWidget('result');

    const truncRes = new BooleanVarWidget('truncRes', true);
    const w = new DivisionWidget();
    w.setParameters(nr1, nr2, truncRes);
    w.setResultVar(result);
    w.execute();

    console.log(result.name, result.value);

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
