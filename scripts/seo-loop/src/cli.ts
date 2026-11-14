import { runApply } from './apply.js'
import { runCheck } from './check.js'
import { runEvaluate } from './evaluate.js'
import { runFetch } from './fetch.js'
import { runPropose } from './propose.js'
import { runSelect } from './select.js'

async function main() {
  const cmd = process.argv[2] || 'check'

  switch (cmd) {
    case 'check':
      await runCheck()
      break
    case 'fetch':
      await runFetch()
      break
    case 'select':
      runSelect()
      break
    case 'propose':
      await runPropose()
      break
    case 'apply':
      await runApply()
      break
    case 'evaluate':
      await runEvaluate()
      break
    case 'run-all':
      // Actions 手動実行用。ローカルでは check → 確認 → apply を推奨
      await runEvaluate()
      await runFetch()
      runSelect()
      await runPropose()
      await runApply()
      break
    case 'run-weekly':
      // 互換 alias
      await mainWith('run-all')
      break
    default:
      console.error(
        `unknown command: ${cmd}\nusage: check|fetch|select|propose|apply|evaluate|run-all`,
      )
      process.exit(1)
  }
}

async function mainWith(cmd: string) {
  process.argv[2] = cmd
  await main()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
