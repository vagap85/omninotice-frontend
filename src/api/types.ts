interface ImproveTextResult {
  text: string;
  title: string;
  description: string;
}

export interface ImproveTextResponse {
  answerFirst: ImproveTextResult;
  answerSecond: ImproveTextResult;
}