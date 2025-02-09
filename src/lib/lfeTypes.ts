export interface ProblemInfo {
  acceptSolution: boolean;
  difficulty: number;
  pid: string;
  tags: number[];
}
export interface FeInjection {
  currentTemplate: string;
  currentUser: { isAdmin: boolean };
  currentData: { problem: ProblemInfo };
}
