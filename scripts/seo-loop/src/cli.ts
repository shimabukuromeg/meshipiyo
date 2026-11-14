import { runApply } from './apply.js'
import { runEvaluate } from './evaluate.js'
import { runFetch } from './fetch.js'
import { runPropose } from './propose.js'
import { runSelect } from './select.js'

async function main() {
  const cmd = process.argv[2] || 'run-weekly'

  switch (cmd) {
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
    case 'run-weekly':
      await runEvaluate()
      await runFetch()
      runSelect()
      await runPropose()
      await runApply()
      break
    default:
      console.error(
        `unknown command: ${cmd}\nusage: fetch|select|propose|apply|evaluate|run-weekly`,
      )
      process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
