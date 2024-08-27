export interface ProblemInfo {
  difficulty: number;
  acceptSolution: boolean;
  tags: number[];
}
export interface Tag {
  id: number;
  name: string;
}
export interface TagsSection {
  id?: number;
  name: string;
  item: Tag[];
}
export interface FeInjection {
  currentData: any;
  currentUser: any;
  currentTemplate: string;
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
export interface ModuleExports {
  name?: string;
  load: () => void | Promise<void>;
  condition: () => boolean;
  obCondition?: (e: Element) => boolean;
}
