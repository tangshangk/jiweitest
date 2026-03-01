import { DocumentCategory, Question } from '../types';
import { questionsDoc1 } from './questions_doc1';
import { questionsDoc2 } from './questions_doc2';
import { questionsDoc3 } from './questions_doc3';
import { questionsDoc4 } from './questions_doc4';
import { questionsDoc5 } from './questions_doc5';
import { questionsDoc6 } from './questions_doc6';
import { questionsDoc7 } from './questions_doc7';
import { questionsDoc8 } from './questions_doc8';
import { questionsDoc9 } from './questions_doc9';
import { questionsDoc10 } from './questions_doc10';
import { questionsDoc11 } from './questions_doc11';
import { questionsDoc12 } from './questions_doc12';
import { questionsDoc13 } from './questions_doc13';
import { questionsDoc14 } from './questions_doc14';
import { questionsDoc15 } from './questions_doc15';
import { questionsDoc16 } from './questions_doc16';

export const documents: DocumentCategory[] = [
  { id: 'doc1', title: '党的纪律检查机关案件审理工作条例' },
  { id: 'doc2', title: '关于新形势下党内政治生活的若干准则' },
  { id: 'doc3', title: '纪检监察机关处理检举控告工作规则' },
  { id: 'doc4', title: '信访工作条例' },
  { id: 'doc5', title: '中共中央纪律检查委员会关于审理党员违纪案件工作程序的规定' },
  { id: 'doc6', title: '中国共产党党内监督条例' },
  { id: 'doc7', title: '二十届中央纪委四次全会公报' },
  { id: 'doc8', title: '二十届中央纪委五次全会公报' },
  { id: 'doc9', title: '中国共产党纪律处分条例' },
  { id: 'doc10', title: '中国共产党纪律检查机关案件检查工作条例' },
  { id: 'doc11', title: '中国共产党纪律检查机关监督执纪工作规则' },
  { id: 'doc12', title: '中国共产党廉洁自律准则' },
  { id: 'doc13', title: '中国共产党巡视工作条例' },
  { id: 'doc14', title: '中国共产党章程' },
  { id: 'doc15', title: '中华人民共和国监察法' },
  { id: 'doc16', title: '中华人民共和国监察法实施条例' },
];

export const questions: Question[] = [
  ...questionsDoc1,
  ...questionsDoc2,
  ...questionsDoc3,
  ...questionsDoc4,
  ...questionsDoc5,
  ...questionsDoc6,
  ...questionsDoc7,
  ...questionsDoc8,
  ...questionsDoc9,
  ...questionsDoc10,
  ...questionsDoc11,
  ...questionsDoc12,
  ...questionsDoc13,
  ...questionsDoc14,
  ...questionsDoc15,
  ...questionsDoc16,
];

