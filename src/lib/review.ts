export interface Review {
  id: string;
  author: number;
  title?: string;
  category?: number;
  pid?: string;
  collection?: {
    id: number;
    name: string;
  };
  time: string;
  accepted: boolean;
}

export const articleCategories = [
  '',
  '个人记录',
  '题解',
  '科技·工程',
  '算法·理论',
  '生活·游记',
  '学习·文化课',
  '休闲·娱乐',
  '闲话',
];
