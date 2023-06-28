import { Command } from 'commander'
import del from './commands/delete'
import deleteRest from './commands/deleteRest'

const program = new Command()

program
  .command('delete')
  .description('删除分支3')
  .option('-f, --force', '强制删除非远程分支的本地分支')
  .option('-s, --select', '可选删除非远程分支的本地分支')
  .action((name, options) => {
    const { args } = options.parent
    if (args[1]) {
      deleteRest(args[1])
    } else {
      del()
    }
  })

program.parse(process.argv)
