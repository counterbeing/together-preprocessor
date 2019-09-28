import "regenerator-runtime/runtime"
import { expect } from "chai"
import gmm from "../src/get-media-metadata.js"

describe("Processing videos", function() {
  it("should return expected data", async function() {
    const expectedMeta = {
      file: "IMG_5555.m4v",
      date: "2019-09-27T21:43:30.000Z",
      description: "Watch fingers wiggle.",
      lat: 47.684888888888885,
      lng: -122.37798888888888,
      width: 1920,
      height: 1080,
      checksum: "11d58315e6833117a52b33be6319bcaf"
    }

    const result = await gmm("./test/fixtures/IMG_5555.m4v")
    expect(result).to.eql(expectedMeta)
  })
})

describe("Processing images", function() {
  it("should return expected data", async function() {
    const expectedMeta = {
      file: "IMG_5553.jpg",
      date: "2019-09-26T00:14:08.000Z",
      description:
        "Apparently these make your tongue numb if you lick them. Katie made me do it.",
      lat: 47.484233333333336,
      lng: -121.77191944444445,
      width: 4032,
      height: 3024,
      checksum: "eba352d64d3e6582daed47381671ff55"
    }

    const result = await gmm("./test/fixtures/IMG_5553.jpg")
    expect(result).to.eql(expectedMeta)
  })
})
