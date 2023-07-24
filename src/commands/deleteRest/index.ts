import simpleGit from 'simple-git'
import Spinner from '../../utils/spinner'
import chalk from 'chalk'
import inquirer from 'inquirer'
import Table from 'cli-table'

const git = simpleGit()

// 获取diff远程分支后的差异本地分支
const getRestBranch = (remoteList, localBranchs, current) => {
  const { all: localList, branches } = localBranchs
  const restBranch = []

  const filterRemoteList = remoteList.map((rBranch) =>
    rBranch.replace('origin/', ''),
  )
  for (const lBranch of localList) {
    if (!filterRemoteList.includes(lBranch) && lBranch !== current) {
      restBranch.push({
        label: lBranch,
        value: lBranch,
        info: branches[lBranch].label,
      })
    }
  }

  return restBranch
}

// 将可选择的分支展现出来
const loggerTable = (list = []) => {
  const table = new Table({
    head: ['本地分支', 'commit信息'],
    colWidths: [21, 25],
  })
  console.log('list', list)
  const data = list.map((item) => [item.value, item.info])
  table.push(...data)
  console.log('table', table)
  console.log(table.toString())
}

// 删除本地分支
const deleteBranchIng = (branchs) => {
  Spinner.start('正在删除...')
  git.deleteLocalBranches(branchs).then(() => {
    Spinner.stop(true)
    console.log(chalk.green('删除成功！'))
  })
}

const deleteCompareRemote = async (r) => {
  Spinner.start('正在从远程拉取分支...')
  git.pull('origin')
  Spinner.stop(true)

  const fetchArr = [await git.branch(['-r']), await git.branchLocal()]
  Promise.all(fetchArr)
    .then((result) => {
      Spinner.stop(true)
      const { current } = result[1]
      const restBranchList = getRestBranch(result[0].all, result[1], current)

      if (!restBranchList.length) {
        console.log(
          chalk.red(
            '与远程分支对比后，且已过滤当前分支与master分支，暂无需要删除的本地分支',
          ),
        )
        return
      }

      inquirer.prompt([
        {
          type: 'checkbox',
          name: 'devBranchs',
          message: 'Which branchs do you want to select?',
          choices: restBranchList.map((branch) => ({
            name:
              branch === current
                ? chalk.red(`${branch.label}（当前分支1）（${branch.info}）`)
                : chalk.green(`${branch.label} （${branch.info}）`),
            value: branch,
            disabled: branch === current,
          })),
        },
      ])

      // inquirer
      //   .prompt([
      //     {
      //       type: 'confirm',
      //       loop: false,
      //       name: 'isDelete',
      //       message: '是否一键删除表中所有分支(已自动过滤当前分支)？',
      //     },
      //   ])
      //   .then((answers) => {
      //     const { isDelete } = answers
      //     if (isDelete) {
      //       deleteBranchIng(restBranchList)
      //     }
      //   })
    })
    .catch((e) => {
      chalk.red('拉取远程分支失败')
      Spinner.stop(true)
    })
}

export default deleteCompareRemote
