import figlet from "figlet"
import chalk from "chalk"
import inquirer from "inquirer"
import chrono from "chrono-node"
import YAML from "yamljs"
import { kebabCase } from "lodash"
import moment from "moment"
import fs from "fs"

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync("STORY", {
        font: "isometric1",
        horizontalLayout: "default",
        verticalLayout: "default"
      })
    )
  )
}

const askQuestions = () => {
  const questions = [
    {
      name: "TITLE",
      type: "input",
      message: "What's the title of your story?"
    },

    {
      name: "LOCATION",
      type: "input",
      message: "Where was this?"
    },
    {
      name: "BEGINNING",
      type: "input",
      message: "When does your story start?"
    },

    {
      name: "ENDING",
      type: "input",
      message: "And when does it end?"
    }
  ]
  return inquirer.prompt(questions)
}

function parseDate(dateString) {
  return chrono.parseDate(dateString)
}

const run = async () => {
  init()

  const answers = await askQuestions()
  const { TITLE, LOCATION, BEGINNING, ENDING } = answers

  const o = {
    title: TITLE,
    location: LOCATION,
    start_date: parseDate(BEGINNING),
    end_date: parseDate(ENDING)
  }

  const yamlString = YAML.stringify(o)
  const file = `
${yamlString}
---
My story goes here!
`
  const filename = kebabCase(
    moment(o.start_date).format("YYYY-MM-DD") + o.title
  )
  fs.writeFile(`stories/${filename}.md`, "Hello content!", function(err) {
    if (err) throw err
    console.log("Saved!")
  })
}

run()
