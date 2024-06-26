"use client";

import dfaMinimizationExamples from "@/assets/examples/dfa-minimization.json";
import BreadCrumbComponent from "@/components/breadcrumb";
import ContainerComponent from "@/components/container";
import DiagramInputComponent from "@/components/diagram-input";
import MermaidComponent from "@/components/mermaid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { dataConverterRepository } from "@/lib/repositories/v2/data-converter";
import { dfaMinimizationRepository } from "@/lib/repositories/v2/dfa-minimization";
import { diagramRepository } from "@/lib/repositories/v2/diagram";
import { inputValidatorRepository } from "@/lib/repositories/v2/input-validator";
import { DFADataProps, DiagramInputTransitionsProps } from "@/lib/types/types";
import { generateRandomStrings } from "@/lib/utils";
import { Dices, Minimize2, RotateCcw, SpellCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function Page() {
  // dfa input
  const [alphabets, setAlphabets] = useState("");
  const [states, setStates] = useState("");
  const [startState, setStartState] = useState("");
  const [finalStates, setFinalStates] = useState("");
  const [transitions, setTransitions] = useState<DiagramInputTransitionsProps>(
    {}
  );

  const [exampleIndex, setExampleIndex] = useState(0);
  const [minifiedDfa, setMinifiedDfa] = useState<{
    others: {
      subsets: { [key: string]: string[] }[];
      newStates: string[];
      equivalences: { [key: string]: string[] };
      newFinalStates: string[];
      newTransitions: { [key: string]: { [key: string]: string } };
    };
    dfaData: DFADataProps;
  }>();
  const [diagrams, setDiagrams] = useState({
    initial: "",
    minified: "",
  });
  const [isGenerated, setIsGenerated] = useState(false);
  const [inputString, setInputString] = useState("");
  const [resultValidateInputString, setResultValidateInputString] = useState<{
    initial: {
      isAccept: boolean;
      history: {
        str: string;
        from: string;
        to: string;
      }[];
    };
    minified: {
      isAccept: boolean;
      history: {
        str: string;
        from: string;
        to: string;
      }[];
    };
  }>();
  const { toast } = useToast();

  const onClickButtonMinimize = () => {
    try {
      const data = dataConverterRepository.convertDFAInput({
        alphabets,
        states,
        startState,
        finalStates,
        transitions,
      });

      const result = dfaMinimizationRepository.convertDFAToMinifiedDFA(data);

      setDiagrams({
        initial: diagramRepository.generateDFA(data),
        minified: diagramRepository.generateDFA(result.dfaData),
      });

      setMinifiedDfa(result);
      setIsGenerated(true);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan!",
        description: String(e),
      });
    }
  };

  const onClickButtonReset = () => {
    setAlphabets("");
    setStates("");
    setStartState("");
    setFinalStates("");
    setTransitions({});
    setIsGenerated(false);
    setInputString("");
    setResultValidateInputString(undefined);
  };

  const onClickButtonExample = () => {
    const examplesCount = dfaMinimizationExamples.length;

    const example = dfaMinimizationExamples[exampleIndex];
    setAlphabets(example.alphabets.join(","));
    setStates(example.states.join(","));
    setStartState(example.startState);
    setFinalStates(example.finalStates.join(","));
    setTimeout(() => setTransitions(example.transitions as any), 100);

    setExampleIndex(exampleIndex < examplesCount - 1 ? exampleIndex + 1 : 0);

    toast({
      description:
        "Menggunakan contoh minimisasi DFA ke-" +
        (exampleIndex + 1) +
        " dari " +
        examplesCount,
    });
  };

  const onClickButtonExampleInputString = () => {
    if (alphabets) {
      const len = Math.floor(Math.random() * 8) + 3;
      setInputString(generateRandomStrings(alphabets.replaceAll(",", ""), len));
    }
  };

  const onClickButtonValidateInputString = () => {
    if (minifiedDfa) {
      const initialData = dataConverterRepository.convertDFAInput({
        alphabets,
        states,
        startState,
        finalStates,
        transitions,
      });
      const initialResult = inputValidatorRepository.validateInputForDFA(
        initialData,
        inputString
      );

      const minifiedData = minifiedDfa.dfaData;
      const minifiedResult = inputValidatorRepository.validateInputForDFA(
        minifiedData,
        inputString
      );

      setResultValidateInputString({
        initial: initialResult,
        minified: minifiedResult,
      });
    }
  };

  useEffect(() => {
    setIsGenerated(false);
    setInputString("");
    setResultValidateInputString(undefined);
  }, [alphabets, states, startState, finalStates, transitions]);

  return (
    <>
      <ContainerComponent safeTop className="py-8">
        <BreadCrumbComponent
          items={[
            { label: "Halaman Utama", href: "/" },
            { label: "DFA Minimization", href: "/v2/dfa-minimization" },
          ]}
        />

        <p className="text-3xl font-semibold mt-4">DFA Minimization</p>
        <p className="mt-2">
          Simulator untuk mengubah DFA menjadi minimal, kemudian pengguna dapat
          mengetes kedua DFA tersebut (sebelum dan sesudah dilakukan minimisasi)
        </p>

        <DiagramInputComponent
          diagramType="dfa"
          input={{
            alphabets,
            states,
            startState,
            finalStates,
            transitions,
            setAlphabets,
            setStates,
            setStartState,
            setFinalStates,
            setTransitions,
          }}
          className="mt-8"
        />

        <div className="flex items-center gap-1 justify-end mt-8">
          <Button variant={"secondary"} onClick={onClickButtonExample}>
            <Dices className="w-4 h-4 mr-2" />
            Contoh
          </Button>
          <Button variant={"destructive"} onClick={onClickButtonReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={onClickButtonMinimize} disabled={isGenerated}>
            <Minimize2 className="w-4 h-4 mr-2" />
            Minimisasi
          </Button>
        </div>

        {/* result */}
        {isGenerated && minifiedDfa && (
          <>
            {/* <JsonViewComponent data={minifiedDfa} /> */}

            <Separator className="mt-8" />

            <section className="mt-8">
              <p className="text-xl font-semibold">Subset Construction</p>
              <p>
                Berikut adalah hasil minimisasi menggunakan metode subset
                construction. Dimana terdapat terdapat{" "}
                {minifiedDfa.others.subsets.length} equivalences sebagai berikut
              </p>
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Step</TableHead>
                    <TableHead>Equivalence</TableHead>
                    <TableHead>Subset</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {minifiedDfa.others.subsets.map((subset, index) => (
                    <TableRow key={"table-row-subset-" + index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>Eq-{index}</TableCell>
                      <TableCell>
                        {"{"}
                        {Object.values(subset)
                          .map((item) => item)
                          .join("} {")}
                        {"}"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>States</TableCell>
                    <TableCell>
                      {minifiedDfa.others.newStates.join(",")}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>Final states</TableCell>
                    <TableCell>
                      {minifiedDfa.others.newFinalStates.join(",")}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </section>

            <section className="mt-8">
              <p className="font-semibold text-xl">Transitions Table</p>
              <p>
                Berikut adalah transitions table dari DFA setelah dilakukan
                minimisasi menjadi {minifiedDfa.others.newStates.length} states
              </p>

              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    {minifiedDfa.dfaData.alphabets.map((alphabet, index) => (
                      <TableHead key={"transitions-table-head-" + index}>
                        {alphabet}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(minifiedDfa.dfaData.transitions).map(
                    (entry, index) => (
                      <TableRow key={"transitions-table-row-" + index}>
                        <TableCell>
                          {entry[0] === minifiedDfa.dfaData.startState && "-> "}
                          {minifiedDfa.dfaData.finalStates.includes(entry[0]) &&
                            "*"}
                          {entry[0]}
                        </TableCell>
                        {minifiedDfa.dfaData.alphabets.map(
                          (alphabet, index2) => (
                            <TableCell
                              key={
                                "transitions-table-row-cell-" + index + index2
                              }
                            >
                              {entry[1][alphabet]}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </section>

            <section className="mt-8">
              <p className="font-semibold text-xl">State Diagram</p>
              <p>
                Berikut adalah state diagram DFA sebelum dan sesudah dilakukan
                minimisasi
              </p>

              <Tabs defaultValue="initial" className="w-full mt-4">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="initial">Initial</TabsTrigger>
                  <TabsTrigger value="minified">Minimisasi</TabsTrigger>
                </TabsList>

                <TabsContent value="initial">
                  <MermaidComponent
                    chart={diagrams.initial}
                    id="initial-dfa-diagram"
                  />
                </TabsContent>

                <TabsContent value="minified">
                  <MermaidComponent
                    chart={diagrams.minified}
                    id="minified-dfa-diagram"
                  />
                </TabsContent>
              </Tabs>
            </section>

            <section className="mt-8">
              <p className="font-semibold text-xl">Input String</p>
              <p>
                Cek masukan string untuk DFA yang belum diminimisasi dan DFA
                yang sudah diminimisasi, apakah di-reject atau di-accept
              </p>

              <div className="mt-4 space-y-1">
                <Label>Masukkan input string</Label>
                <div className="flex items-center gap-1">
                  <Input
                    className="flex-1"
                    value={inputString}
                    onChange={(e) => setInputString(e.target.value)}
                  />
                  <Button
                    variant={"secondary"}
                    size={"icon"}
                    onClick={onClickButtonExampleInputString}
                  >
                    <Dices className="w-4 h-4" />
                  </Button>
                  <Button onClick={onClickButtonValidateInputString}>
                    <SpellCheck className="w-4 h-4 mr-2" />
                    Cek
                  </Button>
                </div>
              </div>

              {resultValidateInputString && (
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead rowSpan={2}>String</TableHead>
                      <TableHead colSpan={2}>Initial</TableHead>
                      <TableHead colSpan={2}>Minimisasi</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultValidateInputString.initial.history.map(
                      (initialItem, index) => (
                        <TableRow
                          key={
                            "transitions-table-input-validator-body-row-" +
                            index
                          }
                        >
                          <TableCell>{initialItem.str}</TableCell>
                          <TableCell>{initialItem.from}</TableCell>
                          <TableCell>{initialItem.to}</TableCell>
                          <TableCell>
                            {
                              resultValidateInputString.minified.history[index]
                                .from
                            }
                          </TableCell>
                          <TableCell>
                            {
                              resultValidateInputString.minified.history[index]
                                .to
                            }
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>Acceptances</TableCell>
                      <TableCell colSpan={2}>
                        {String(resultValidateInputString.initial.isAccept)}
                      </TableCell>
                      <TableCell colSpan={2}>
                        {String(resultValidateInputString.minified.isAccept)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </section>
          </>
        )}
      </ContainerComponent>
    </>
  );
}
