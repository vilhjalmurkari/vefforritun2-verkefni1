const express = require('express');
const md = require('markdown').markdown;
const fm = require('front-matter');
const fs = require('fs');
const util = require('util');

const router = express.Router();

const readFileAsync = util.promisify(fs.readFile);


const files = ['./articles/batman-ipsum.md',
  './articles/corporate-ipsum.md',
  './articles/deloren-ipsum.md',
  './articles/lorem-ipsum.md'];


const grein = [];
const efniGreina = [];


function sortArticle() {
  for (let i = 1; i < grein.length; i += 1) {
    for (let j = i; j > 0; j -= 1) {
      const x = (new Date(grein[i].attributes.date)).getDate();
      const y = (new Date(grein[j - 1].attributes.date)).getDate();

      if (x > y) {
        const temp = grein[i];
        grein[i] = grein[j - 1];
        grein[j - 1] = temp;

        const temp2 = efniGreina[j];
        efniGreina[j] = efniGreina[j - 1];
        efniGreina[j - 1] = temp2;
      }
    }
  }
}


async function middleware(res, req, next) {
  for (let i = 0; i < files.length; i += 1) {
    readFileAsync(files[i], 'utf-8', (err, data) => {
      if (err) throw err;

      if (grein.length < 4) {
        const content = fm(data);
        grein.push(content);

        const gogn = md.parse(data);
        efniGreina.push(gogn);
      }
    });
  }

  sortArticle();

  next();
}


router.get('/', middleware, (req, res) => {
  res.render('greinasafn', { title: 'Greinasafnið', grein });
});


function finnaGrein(url) {
  for (let i = 0; i < 4; i += 1) {
    if (`/${grein[i].attributes.slug}` === url) {
      return efniGreina[i];
    }
  }
  return efniGreina[0];
}

function erGreinTil(url) {
  for (let i = 0; i < 4; i += 1) {
    if (`/${grein[i].attributes.slug}` === url) {
      return true;
    }
  }
  return false;
}


router.get('/:slug', (req, res) => {
  if (erGreinTil(req.originalUrl)) {
    const gogn = finnaGrein(req.originalUrl);
    const htmldata = md.toHTML(gogn);
    res.render('article', { title: gogn[3][2], htmldata });
  } else {
    res.status(404).render('404', { title: 'Fannst ekki', text: 'Ó nei, efnið finnst ekki!' });
  }
});


module.exports = router;
