import SpinnerCli from 'cli-spinner'
import chalk from 'chalk'

// const chalk = require('chalk');

const spinner = SpinnerCli.Spinner()
spinner.setSpinnerString('⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏') // https://github.com/sindresorhus/cli-spinners/blob/master/spinners.json

export default {
  start: (title?: string): void => {
    if (title) {
      spinner.setSpinnerTitle(`${chalk.yellow('%s')} ${title}`)
    }
    spinner.start()
  },
  stop: (clear = false): void => {
    spinner.stop(clear)
  },
  setTitle: (title = ''): void => {
    spinner.setSpinnerTitle(title)
  },
  setString: (string = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'): void => {
    spinner.setSpinnerString(string)
  },
}
