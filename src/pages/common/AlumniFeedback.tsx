import { BaseDropdown, Button, Input } from "@ui/index";
import QuestionsCard from "@ui/QuestionsCard";
import FairIcon from "@icons/Poor.png";
import GoodIcon from "@icons/VeryGood.png";
import ExcellentIcon from "@icons/Excellent.png";
import { Dispatch, FC, SetStateAction, useMemo, useState } from "react";
import {
  insertAlumniAnswers,
  insertAlumniResponse,
} from "@/graphql/mutations/insertAlumniResponse";
import { useMutation } from "urql";
import { Dialog } from "@headlessui/react";
import { NavLink } from "react-router-dom";
import { useAlumniFeedbackQuery } from "@/graphql/queries/alumniFeedbackQuery";
import { EmployerFeedbackOptions } from "./EmployerFeedback";
import { useDeptsQuery } from "@/graphql/queries/deptOptions";

interface ThankYouModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const ThankYouModal: FC<ThankYouModalProps> = ({ isOpen, setIsOpen }) => {
  return (
    <Dialog open={isOpen} onClose={() => {}} className="fixed inset-0">
      <Dialog.Overlay className="fixed inset-0 bg-gray-700/80" />
      <Dialog.Panel className="absolute inset-8 mx-auto my-auto h-fit max-w-xl space-y-8 rounded-3xl bg-white p-4 text-gray-50 ">
        <h2 className="flex flex-col space-y-4 text-center text-3xl text-blue-800">
          <span>Thank You</span> <span>For Your Feedback!!!</span>
        </h2>

        <Button className="mx-auto w-fit px-8" as={NavLink} to="/">
          Okay
        </Button>
      </Dialog.Panel>
    </Dialog>
  );
};

interface OptionProps {
  score: number;
  review: string;
  image: string;
}

interface ReactiveQuestionCardProps {
  question: string;
  options: OptionProps[];
  value: number;
  setValue:
    | React.Dispatch<React.SetStateAction<number>>
    | ((value: number) => void)
    | (() => void);
}
const ReactiveQuestionCard: FC<ReactiveQuestionCardProps> = (props) => {
  const { options, ...rest } = props;
  const [optionsReactive, setOptionsReactive] = useState(options);

  return <QuestionsCard options={optionsReactive} {...rest} />;
};

const AlumniFeedback = () => {
  const { data, loading } = useAlumniFeedbackQuery(); // gets the question from supabase

  const getOptionIcon = (value: number) => {
    switch (value) {
      case 1:
        return FairIcon;
      case 2:
        return GoodIcon;
      case 3:
        return ExcellentIcon;

      default:
        return FairIcon;
    }
  };

  const { data: deptOptions } = useDeptsQuery();

  const [alumniName, setAlumniName] = useState("");
  const [batch, setBatch] = useState("");
  const [dept, setDept] = useState(deptOptions[0]);
  const [isThankYouModalOpen, setIsThankYouModalOpen] = useState(false);

  const [reviews, setReviews] = useState({});

  // construct the state that contains question id and its answer
  useMemo(() => {
    let val = {};
    data.peo?.forEach((ques) => {
      val = { ...val, [ques.id]: 0 };
    });
    data.po?.forEach((ques) => {
      val = { ...val, [ques.id]: 0 };
    });

    setReviews(val);
  }, [data]);

  // determine if all the questions are answered and enable the submit button
  const isSubmittable = useMemo(
    () => Object.values(reviews).includes(0),
    [reviews]
  );

  // graphql mutations for insertion
  const [alumniRes, insertAlumniResponseFn] = useMutation(insertAlumniResponse);
  const [alumniAns, insertAlumniAnswersFn] = useMutation(insertAlumniAnswers);

  const handleSubmit = () => {
    // Validations
    if (alumniName === "") {
      alert("Please Enter Your Name");
      return;
    }
    if (batch === "") {
      alert("Please Enter Your Batch");
      return;
    }
    if (/^[1-2][0,9][0-9][0-9]$/.test(batch) === false) {
      alert("Please Enter a Valid Batch");
      return;
    }
    if (dept.id === "") {
      alert("Please Select Your Department");
      return;
    }

    insertAlumniResponseFn({
      alumni_name: alumniName,
      batch,
      dept_id: parseInt(dept.id),
    }).then((respRes) => {
      if (respRes.error) {
        console.error(respRes.error);
        return;
      }
      const alumniResponseId: number =
        respRes.data?.insertIntoalumni_responseCollection?.records[0].id;
      const alumniAnsVars = Object.entries(reviews).map((val) => ({
        alumni_res_id: alumniResponseId,
        question_id: parseInt(val[0]),
        answer: val[1] as number,
      }));

      insertAlumniAnswersFn({ objects: alumniAnsVars }).then((ansRes) => {
        if (ansRes.error) console.error(ansRes.error);

        setIsThankYouModalOpen(true);
      });
    });
  };

  return (
    <div className="my-8 ">
      <header>
        <h1 className="text-center text-3xl font-semibold text-blue-800">
          Alumni Feedback
        </h1>
      </header>
      <main className="m-8 space-y-8 ">
        <section className="space-y-4">
          <Input
            id="alumni-name"
            name="Alumni Name"
            placeholder="Alumni Name"
            type="text"
            value={alumniName}
            setValue={setAlumniName}
          />
          <Input
            id="batch"
            name="Batch"
            placeholder="Batch"
            type="text"
            value={batch}
            setValue={setBatch}
          />
          <BaseDropdown
            label="Department"
            value={dept}
            setValue={setDept}
            options={deptOptions}
          />
        </section>

        <section className="space-y-4 rounded-lg border-2 border-gray-500/30 p-4">
          <h2 className="text-center text-3xl font-semibold text-blue-900/80">
            PEOs
          </h2>
          {data.peo?.map((questions, idx) => {
            return (
              <ReactiveQuestionCard
                key={questions.id}
                // @ts-ignore
                options={questions.options?.map((val) => ({
                  score: val.value,
                  review: val.option,
                  image: getOptionIcon(val.value as number),
                }))}
                question={
                  `${questions.questionNo}. ${questions.question}` as string
                }
                // @ts-ignore
                value={reviews[questions.id]}
                setValue={(value: number) => {
                  setReviews({ ...reviews, [questions.id]: value });
                }}
              />
            );
          })}
        </section>

        <section className="space-y-4 rounded-lg border-2 border-gray-500/30 p-4">
          <h2 className="text-center text-3xl font-semibold text-blue-900/80">
            POs
          </h2>
          {data.po?.map((questions) => {
            // const pos = idx + 1;
            return (
              <QuestionsCard
                key={questions.id}
                options={EmployerFeedbackOptions}
                question={
                  `${questions.questionNo}. ${questions.question}` as string
                }
                // @ts-ignore
                value={reviews[questions.id]}
                setValue={(value: number) => {
                  setReviews({ ...reviews, [questions.id]: value });
                }}
              />
            );
          })}
        </section>
      </main>

      <Button
        className="mx-auto"
        onClick={handleSubmit}
        disabled={isSubmittable}
      >
        Submit Feedback
      </Button>

      <ThankYouModal
        isOpen={isThankYouModalOpen}
        setIsOpen={setIsThankYouModalOpen}
      />
    </div>
  );
};

export default AlumniFeedback;
export { EmployerFeedbackOptions };
