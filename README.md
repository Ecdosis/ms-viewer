## ms-viewer
The idea for MS-viewer is to view manuscripts in a book-like two-page spread, even though the images are only page-by page. In manuscripts you also often have some kind of page-numbering that is full of errors, so you need some way to overcome that and work out which images are recto and which are verso. Also, sometime, you find full-page spreads, so you have three page orientation types.

The prototype viewer, which uses manuscript B78 of the Charles Harpur (1813-1867) archive is a case in point. There are two full-page spreads at pp.138-139. Also three sets of page-numbers: 1-162, then i-v, then 1-78. There is also "front inside cover" and "cover". And you can't derive the recto-verso properties from the file names (00000023.jpg etc.) because of the full-page spreads in the sequence. So the idea of MS-viewer is to provide JSON metadata for each image. Since typing this would be tedious, the Paginator tool to generate the metadata.

### Paginator
The metadata for each page consists of the name of the page. The "o" property describes the orientation, which can be "v" (verso), "r" (recto) or "c" (centred). The "src" property is the name of the image file. The "n" property is the name of the page, which can be anything, but it will only get incremented if it follows either a simple Roman numeral pattern or an Arabic number with some kind of suffix. The suffix gets append for subsequent values but the number gets incremented. e.g. the next numebr after "128a" is "129a". For example:

    { "src": "00000234.jpg", "n": "61b", "o": "r" } 

To avoid typing all of them the metadata only for exceptional pages that break the sequence is needed. Paginator assumes that odd-numbered *image files* are rectos, and even-numbered ones are versos. If that is not the case then a special metadata entry should be created to override that. The pagination will then proceed from that point using the override. So if you gave this override:

    { "src": "00000123.jpg", "o": "v", "n": "127" }

then subsequent pages would assume that *even-numbered* pages are rectos and odd-numbered ones are versos. So for complex B78 example the entire list is just:

	{
		"docid": "english/harpur/B78",
		"specials": [
		{"src":"00000001.jpg","n":"front cover"},
		{"src":"00000002.jpg","n":"inside front cover"},
		{"src":"00000003.jpg","n":"1a"},
		{"src":"00000142.jpg","o":"c","n":"138a-139a"},
		{"src":"00000143.jpg","n":"138aa","o":"v"},
		{"src":"00000145.jpg","n":"140a","o":"v"},
		{"src":"00000168.jpg","n":"162aa","o":"r"},
		{"src":"00000169.jpg","n":"i","o":"v"},
		{"src":"00000174.jpg","n":"1b","o":"r"}
	]}

Here the "specials" array just lists the exceptional pages. It could be empty. To process this file either run the example implementation in paginator/generate.sh or write your own. Basically it calls a java program Paginator, which requires the other java clases in the paginator folder, and the json-simple library. The two input files are a directory of images, and the exceptions metadata file, the default being b78.metadata. 

    java Paginator <folder> <json-config>

This produces a full list of metadata for each file, which you can pipe to an output file. This can then be pased into the index.html file. Obviously this needs to be split up into a service and proper client, but this is just a prototype for now.
