export interface TagType {
  id: number;
  name: string;
  type: 'Algorithm' | 'Origin' | 'Time' | 'Region' | 'SpecialProblem' | 'Others';
  parent: number | null;
  color?: string;
  hasChildren?: boolean;
}

export const TagPrompt = ({

}) => {

};
