import parseKostentraegerUrls from "../../src/kostentraeger/rssreader"

describe("rss reader", () => {

    it("parse a RSS", async () => {
        const rss = 
            "<rss version=\"2.0\">" +
            "<channel>" +
            "<title>GKV-Datenaustausch</title>" +
            "<link>https://www.gkv-datenaustausch.de</link>" +
            "<item><link>https://foo/AO06Q221.ke1</link></item>" +
            "<item><link>https://foo/BK06Q221.ke1</link></item>" +
            "<item><link>https://foo/BK06Q221.ke2</link></item>" +
            "<item><link>https://foo/BK06Q221.ke0</link></item>" +
            "</channel>" +
            "</rss>"
        expect(parseKostentraegerUrls(rss)).toEqual([
            "https://foo/AO06Q221.ke1",
            "https://foo/BK06Q221.ke2" // took only the most current one
        ])
    })

})