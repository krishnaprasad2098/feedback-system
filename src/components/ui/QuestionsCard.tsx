import { FC, ReactNode } from "react";
import { RadioGroup } from "@headlessui/react";

interface OptionProps {
  score: number;
  review: string;
  image: string;
}

interface QCprops {
  question: string;
  options: OptionProps[];
  value: number;
  // setValue: React.Dispatch<React.SetStateAction<number>>;
  setValue: any;
}

const MyRadioGroup: FC<QCprops> = ({ question, options, value, setValue }) => {
  return (
    <RadioGroup
      value={value}
      onChange={setValue}
      as="div"
      className="space-y-4"
    >
      <RadioGroup.Label className="text-xl font-semibold text-[#192860]">
        {question}
      </RadioGroup.Label>
      <div className="space-y-1">
        {options.map((option) => (
          <RadioGroup.Option
            className="flex items-center gap-4 rounded-xl border-[#90B9F1] px-4 py-2 ui-checked:border-2 ui-checked:bg-[#BED5F5]/50"
            key={option.score}
            value={option.score}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-[#D0D4E3] bg-white ui-checked:border-[#90B9F1]">
              <div className="h-3 w-3 rounded-full bg-[#0059D2] ui-not-checked:hidden"></div>
            </div>
            <img src={option.image} alt={option.review} className="h-12 w-12" />
            <RadioGroup.Description className="text-[#192860] ui-checked:font-semibold">
              {option.review}
            </RadioGroup.Description>
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
};

export default MyRadioGroup;
