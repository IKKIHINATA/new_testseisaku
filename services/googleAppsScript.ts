import { QuizItem } from '../types';

/**
 * Generates a Google Apps Script string to create a Google Form.
 * @param quizItems The array of quiz questions and answers.
 * @param formTitle The title for the Google Form.
 * @param formDescription The description for the Google Form.
 * @param folderUrl The URL of the Google Drive folder to save the form in (optional).
 * @returns A string containing the full Google Apps Script code.
 */
export function generateGoogleAppsScript(quizItems: QuizItem[], formTitle: string, formDescription: string, folderUrl?: string): string {
  const quizDataString = JSON.stringify(quizItems, null, 2);
  const safeFolderUrl = folderUrl ? folderUrl.replace(/"/g, '\\"') : '';

  return `
/**
 * このスクリプトは、TOKIUMテスト制作サイトによって生成されました。
 * 実行すると、あなたのGoogleドライブに新しいGoogleフォームが作成されます。
 * 
 * === 使い方 ===
 * 1. このコードをすべてコピーします。
 * 2. script.google.com にアクセスし、「新しいプロジェクト」をクリックします。
 * 3. エディタ内の既存のコードを削除し、このコードを貼り付けます。
 * 4. 上部の「実行」ボタン（▶️アイコン）をクリックします。
 * 5. 初回実行時に、Googleアカウントへのアクセス許可を求められます。「許可を確認」→自分のアカウントを選択→「詳細」→「（安全でないページ）に移動」→「許可」と進んでください。
 * 6. 実行後、あなたのGoogleドライブに新しいフォームが作成されます。
 */
function createQuizForm() {
  // --- アプリケーションで設定されたデータ ---
  const formTitle = "${formTitle.replace(/"/g, '\\"')}";
  const formDescription = "${formDescription.replace(/"/g, '\\"')}";
  const quizData = ${quizDataString};
  const targetFolderUrl = "${safeFolderUrl}";
  // ------------------------------------

  try {
    // 新しいフォームを作成
    const form = FormApp.create(formTitle);
    form.setDescription(formDescription);
    form.setQuiz(true); // フォームをクイズモードに設定

    // 各質問をフォームに追加
    quizData.forEach(item => {
      const mcItem = form.addMultipleChoiceItem();
      mcItem.setTitle(item.question);
      
      const choices = item.options.map(option => {
        return mcItem.createChoice(option, option === item.answer);
      });
      
      mcItem.setChoices(choices);
      mcItem.setRequired(true);
      
      // クイズのポイント設定 (ここでは各問10点に設定)
      mcItem.setPoints(10);
    });

    let successMessage = 'Googleフォーム「' + formTitle + '」があなたのGoogleドライブのルートに作成されました。';
    
    // フォルダが指定されている場合、そこにフォームを移動
    if (targetFolderUrl) {
      try {
        // URLからフォルダIDを抽出 (より堅牢な正規表現)
        const folderIdMatch = targetFolderUrl.match(/[-\\w]{25,}/);
        if (folderIdMatch && folderIdMatch[0]) {
          const folderId = folderIdMatch[0];
          const folder = DriveApp.getFolderById(folderId);
          const formFile = DriveApp.getFileById(form.getId());
          
          // ルートフォルダからファイルを削除し、指定のフォルダに追加する（移動の挙動）
          DriveApp.getRootFolder().removeFile(formFile);
          folder.addFile(formFile);
          
          successMessage = 'Googleフォーム「' + formTitle + '」が指定されたフォルダ「' + folder.getName() + '」に作成されました。';
        } else if (targetFolderUrl.trim() !== '') {
           Logger.log('有効なGoogleドライブフォルダURLではなかったため、マイドライブのルートに作成しました。 URL: ' + targetFolderUrl);
        }
      } catch (folderError) {
        Logger.log('フォルダへの移動中にエラーが発生しました: ' + folderError.toString() + '。マイドライブのルートに作成されました。');
      }
    }


    Logger.log(successMessage);
    Logger.log('公開用URL: ' + form.getPublishedUrl());
    Logger.log('編集用URL: ' + form.getEditUrl());
    
    // ユーザーへの完了通知は実行ログで行います。

  } catch (e) {
    Logger.log('フォームの作成中にエラーが発生しました: ' + e.toString());
  }
}
`;
}