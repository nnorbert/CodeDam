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
import { IfWidget } from "../../libraries/CodeBuilder/widgets/executables/conditionals/IfWidget";
import { GreaterThanOrEqualConditionWidget } from "../../libraries/CodeBuilder/widgets/conditions/GreaterThanOrEqualCondition";
import { TextVarWidget } from "../../libraries/CodeBuilder/widgets/variables/TextVarWidget";
import { IfElseWidget } from "../../libraries/CodeBuilder/widgets/executables/conditionals/IfElseWidget";

export default function Playground() {
  const isInitialized = useRef(false);
  const executor = useRef<Executor>(undefined);
  
  useEffect(()=>{
    if (isInitialized.current) return;
    isInitialized.current = true;

    const nrA = new NumberVarWidget('a');
    const nrB = new NumberVarWidget('b');
    const result = new NumberVarWidget('result');

    const w1 = new MultiplicationWidget();
    w1.setParameters(nrA, nrB); // 2 * 3
    w1.setResultVar(result);    // 6

    const w2 = new PrintVarWidget();
    w2.setParameters(result);

    executor.current = new Executor();
    executor.current.registerWidget(w1);
    executor.current.registerWidget(w2, w1.id);
    
    const readValue1 = new ReadVarWidget();
    readValue1.setResult(nrA);
    executor.current.registerWidget(readValue1);

    const readValue2 = new ReadVarWidget();
    readValue2.setResult(nrB);
    executor.current.registerWidget(readValue2, readValue1.id);

    const nrC = new NumberVarWidget("c", 50);
    const condA = new GreaterThanOrEqualConditionWidget();
    condA.setParameters(result, nrC);

    const ifW = new IfElseWidget();
    ifW.setParameters(condA);

    const str1 = new TextVarWidget('t', "Greater than 50");
    const str2 = new TextVarWidget('t', "Less than 50");
    const showText1 = new PrintVarWidget();
    showText1.setParameters(str1);
    const showText2 = new PrintVarWidget();
    showText2.setParameters(str2);

    ifW.registerThenWidget(showText1);
    ifW.registerElseWidget(showText2);

    executor.current.registerWidget(ifW, w2.id);
    
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
