import * as Yup from "yup";

export const CreateTeamSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string().optional(),
  topics: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Topic name is required"),
      subTopics: Yup.array().of(
        Yup.object().shape({
          name: Yup.string().required("Subtopic name is required"),
          description: Yup.string().optional()
        })
      ).optional()
    })
  ).optional()
});