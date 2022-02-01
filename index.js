const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const distFolder = 'dist'
const driveFolder = 'drive'
const metadataFolder = path.join(driveFolder, 'metadata')
const layersFolder = path.join(driveFolder, 'layers');

(async () => {
    for (const metadataFilename of fs.readdirSync(metadataFolder)) {
        const metadata = JSON.parse(
            fs.readFileSync(path.join(
                metadataFolder,
                metadataFilename
            ), 'utf-8')
        )

        const parsed = metadata['721']['<policy_id>']['<asset_name>']
        const order = [
            'background',
            'aura',
            'clothing',
            'weapon',
            'race',
            'expression',
            'headwear',
        ]

        const composites = []

        order.forEach(o => {
            const isAcc = o === 'aura'
            const i = isAcc ? 'accessory' : o
            const val = parsed[i].replace(/'/g, "_")
            const folderName = isAcc ? 'aura' : o

            const imageFile = path.join(layersFolder, `${folderName}/${val}.png`)
            if (!fs.existsSync(imageFile)) throw new Error(`Missing: ${imageFile}`)
            composites.push(imageFile)
        })

        console.log(metadataFilename)
        const f = composites[0]
        composites.shift()
        await sharp(f)
            .composite(composites.map(i => ({ input: i })))
            .png({ quality: 95 })
            .toFile(`${distFolder}/${metadataFilename.replace('.metadata', '.png')}`)
    }
})();