require('dotenv').config()
const shell = require('shelljs')
const path = require('path')

shell.exec(
  `CHARTING_LIBRARY_USERNAME=${process.env.CHARTING_LIBRARY_USERNAME} ` +
    `CHARTING_LIBRARY_ACCESS_TOKEN=${process.env.CHARTING_LIBRARY_ACCESS_TOKEN} ` +
    `CHARTING_LIBRARY_REPOSITORY=${process.env.CHARTING_LIBRARY_REPOSITORY} sh ` +
    path.join(__dirname, 'install_charting_library.sh'),
)
