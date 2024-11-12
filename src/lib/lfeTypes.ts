export interface FeInjection {
  currentTemplate: string;
  currentUser: { isAdmin: boolean };
  // biome-ignore lint/suspicious/noExplicitAny:
  currentData: any;
}
export type FeSwalFunction = (
  titleText: string,
  text?: string
) => { params: { titleText: string; text: string; type: string } };
export interface FeInstance {
  $swal: FeSwalFunction;
  $swalInfo: FeSwalFunction;
  $swalWarning: FeSwalFunction;
  $swalError: FeSwalFunction;
  $swalSuccess: FeSwalFunction;
  $swalToastInfo: FeSwalFunction;
  $swalToastWarning: FeSwalFunction;
  $swalToastError: FeSwalFunction;
  $swalToastSuccess: FeSwalFunction;
}
export interface ProblemInfo {
  acceptSolution: boolean;
  difficulty: number;
  tags: number[];
}
