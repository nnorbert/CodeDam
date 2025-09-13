import { useEffect, useRef } from "react";
import { NumberVarWidget } from "../../libraries/CodeBuilder/widgets/variables/NumberVarWidget";
import { AdditionWidget } from "../../libraries/CodeBuilder/widgets/executables/operations/Addition";
import { RemainderWidget } from "../../libraries/CodeBuilder/widgets/executables/operations/Remainder";
import { DivisionWidget } from "../../libraries/CodeBuilder/widgets/executables/operations/Division";
import { BooleanVarWidget } from "../../libraries/CodeBuilder/widgets/variables/BooleanVarWidget";
import { Executor } from "../../libraries/CodeBuilder/Executor";
import { MultiplicationWidget } from "../../libraries/CodeBuilder/widgets/executables/operations/Multiplication";
import { PrintVarWidget } from "../../libraries/CodeBuilder/widgets/executables/interactions/PrintVar";
import { ReadVarWidget } from "../../libraries/CodeBuilder/widgets/executables/interactions/ReadVar";

export default function Playground() {
  const isInitialized = useRef(false);
  const executor = useRef<Executor>(undefined);
  
  useEffect(()=>{
    if (isInitialized.current) return;
    isInitialized.current = true;

    const nrA = new NumberVarWidget('a');
    const nrB = new NumberVarWidget('b');
    const nrC = new NumberVarWidget('c', 4);
    const nrD = new NumberVarWidget('d', 2);
    const result = new NumberVarWidget('result');

    const w1 = new MultiplicationWidget();
    w1.setParameters(nrA, nrB); // 2 * 3
    w1.setResultVar(result);    // 6

    const w2 = new AdditionWidget();
    w2.setParameters(result, nrC); // 6 + 4
    w2.setResultVar(result);       // 10

    const w3 = new DivisionWidget();
    w3.setParameters(result, nrD); // 6 / 2
    w3.setResultVar(result);       // 5


    const w4 = new PrintVarWidget();
    w4.setParameters(result);

    executor.current = new Executor();
    executor.current.registerWidget(w1);
    executor.current.registerWidget(w2, w1.id);
    executor.current.registerWidget(w3, w2.id);
    executor.current.registerWidget(w4, w3.id);

    
    const readValue1 = new ReadVarWidget();
    readValue1.setResult(nrA);
    executor.current.registerWidget(readValue1);

    const readValue2 = new ReadVarWidget();
    readValue2.setResult(nrB);
    executor.current.registerWidget(readValue2, readValue1.id);

    
    console.log(result.value);
  }, []);



  const startExecute = () => {
    if (!executor.current) {
      return;
    }

    executor.current.execute();
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Playground 🦫</h1>
      <p className="text-lg">
        <button onClick={startExecute}>Play</button>
      </p>
    </div>
  );
}
