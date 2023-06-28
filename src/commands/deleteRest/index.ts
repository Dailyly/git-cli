import simpleGit from 'simple-git'
import Spinner from '../../utils/spinner'
import chalk from 'chalk'
import inquirer from 'inquirer'
import Table from 'cli-table'

const git = simpleGit()

const getRestBranch = (remoteList, localList, current) => {
  const restBranch = []

  const filterRemoteList = remoteList.map((rBranch) =>
    rBranch.replace('origin/', ''),
  )
  for (const lBranch of localList) {
    if (!filterRemoteList.includes(lBranch) && lBranch !== current) {
      restBranch.push(lBranch)
    }
  }

  return restBranch
}

const loggerTable = (list = []) => {
  const table = new Table({
    style: { head: ['green'] },
    head: ['与远程对比后余下分支'],
    colWidths: [30],
  })
  const data = list.map((item) => [item])
  table.push(...data)
  console.log(table.toString())
}

const deleteBranchIng = (branchs) => {
  Spinner.start('正在删除...')
  git.deleteLocalBranches(branchs).then(() => {
    Spinner.stop(true)
    console.log(chalk.green('删除成功！'))
  })
}

const deleteCompareRemote = async (r) => {
  Spinner.start('正在从远程拉取分支...')
  const fetchArr = [await git.branch(['-r']), await git.branchLocal()]
  Promise.all(fetchArr)
    .then((result) => {
      Spinner.stop(true)
      const { current } = result[1]
      const restBranchList = getRestBranch(
        result[0].all,
        result[1].all,
        current,
      )

      if (!restBranchList.length) {
        console.log(
          chalk.red(
            '与远程分支对比后，且已过滤当前分支与master分支，暂无需要删除的本地分支',
          ),
        )
        return
      }
      if (r === '-f') {
        loggerTable(restBranchList)

        inquirer
          .prompt([
            {
              type: 'confirm',
              loop: false,
              name: 'isDelete',
              message: '是否一键删除表中所有分支(已自动过滤当前分支)？',
            },
          ])
          .then((answers) => {
            const { isDelete } = answers
            if (isDelete) {
              deleteBranchIng(restBranchList)
            }
          })
      } else {
        inquirer
          .prompt([
            {
              type: 'checkbox',
              loop: false,
              name: 'branchs',
              message: '请选择需要删除的分支(已自动过滤当前分支)',
              choices: restBranchList,
            },
            {
              type: 'confirm',
              loop: false,
              name: 'isDelete',
              message: '是否一键删除所选分支？',
            },
          ])
          .then((answers) => {
            const { branchs, isDelete } = answers
            if (branchs.length && isDelete) {
              deleteBranchIng(branchs)
            }
          })
      }
    })
    .catch((e) => {
      chalk.red('拉取远程分支失败')
      Spinner.stop(true)
    })
}

export default deleteCompareRemote
