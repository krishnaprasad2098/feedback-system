import { graphql } from "@/gql";
import { useMutation } from "urql";

export const insertEmployerResponse = graphql(`
  mutation InsertEmployerResponse($company: String!, $employer_name: String!) {
    insertIntoemployer_responseCollection(
      objects: { company: $company, employer_name: $employer_name }
    ) {
      affectedCount
      records {
        company
        employer_name
        id
      }
    }
  }
`);

export const insertEmployerAnswers = graphql(`
  mutation MyMutation($objects: [employer_answersInsertInput!]!) {
    insertIntoemployer_answersCollection(objects: $objects) {
      affectedCount
    }
  }
`);
