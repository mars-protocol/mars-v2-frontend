require('dotenv').config()
const shell = require('shelljs')
const path = require('path')

if (
  !process.env.CHARTING_LIBRARY_USERNAME ||
  !process.env.CHARTING_LIBRARY_ACCESS_TOKEN ||
  !process.env.CHARTING_LIBRARY_REPOSITORY
) {
  console.log(
    'Charting library credentials are missing. Skipping the install of the charting library.',
    '\n\n',
    'To install the charting library, please provide the following environment variables:',
    '\n',
    'CHARTING_LIBRARY_USERNAME, CHARTING_LIBRARY_ACCESS_TOKEN, CHARTING_LIBRARY_REPOSITORY',
  )
  shell.exec(`sh ` + path.join(__dirname, 'install_dummy_charting_library.sh'))
  return
}

shell.exec(
  `CHARTING_LIBRARY_USERNAME=${process.env.CHARTING_LIBRARY_USERNAME} ` +
    `CHARTING_LIBRARY_ACCESS_TOKEN=${process.env.CHARTING_LIBRARY_ACCESS_TOKEN} ` +
    `CHARTING_LIBRARY_REPOSITORY=${process.env.CHARTING_LIBRARY_REPOSITORY} sh ` +
    path.join(__dirname, 'install_charting_library.sh'),
)
