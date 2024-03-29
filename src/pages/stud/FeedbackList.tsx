import { FC, useContext, useEffect } from "react";
import { ReactComponent as ArrowLong } from "@icons/ArrowLong.svg";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { AuthContext, IAuthContext } from "@/context/auth";
import { useGetStudFeedbackList } from "@/graphql/queries/getStudFeedbackList";
import { Button } from "@/components/ui";

const FeedbackList: FC = () => {
  const { auth } = useContext(AuthContext) as IAuthContext;
  const { feedbackType } = useParams();
  const navigate = useNavigate();

  const { data } = useGetStudFeedbackList(
    auth.profile?.batch!,
    auth.profile?.dept_id!,
    auth.user?.id!,
    auth.profile?.section!
  );

  useEffect(() => {
    if (![undefined, "course", "lab"].includes(feedbackType)) {
      navigate("/stud/404");
    }
  }, [feedbackType]);

  return (
    <main className="space-y-4">
      {data && data.length > 0 ? (
        data[0].staffMapping?.map(
          (val) =>
            val.subject.type === feedbackType && (
              <button
                key={val.id}
                disabled={!(val.responses?.length === 0)}
                onClick={() =>
                  navigate(`/stud/provide-feedback/${feedbackType}/${val.id}`)
                }
                className="flex w-full justify-between gap-4 rounded-xl border border-blue-200 stroke-blue-600 p-4 text-blue-800 disabled:cursor-not-allowed disabled:border-blue-100 disabled:bg-blue-50 disabled:stroke-blue-300 disabled:text-blue-400"
              >
                <p className="text-base">{`${val.subject.name} (${val.subject.code})`}</p>
                <ArrowLong className="h-8 w-8 -translate-y-0.5 " />
              </button>
            )
        )
      ) : (
        <div className="mx-auto w-fit space-y-4">
          <p className="text-3xl font-semibold text-blue-800">
            No Pending Feedbacks
          </p>
          <Button as={NavLink} className="mx-auto w-fit" to="/stud/dashboard">
            Go Home
          </Button>
        </div>
      )}
    </main>
  );
};

export default FeedbackList;
