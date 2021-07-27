const { JSDOM } = require('jsdom');
const axios = require('axios');

module.exports = async (job) => {
    await Promise.all([getGenres(job), getProbs()])
    .then(data => {
        console.log(data);
        return data;
    })
    .catch(err => {
        throw err;
    })
}

const getGenres = async (job) => {
    try {
        const { data } = await axios.get("https://everynoise.com/engenremap.html");
        const { document } = new JSDOM(data).window;

        const genres = [
            {
                name: 'punk',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'jazz',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'classical',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'rock',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'alternativerock',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'reggae',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'ambient',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'world',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'pop',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'metal',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'hiphop',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'electronica',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'chantreligieux',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'blues',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'country',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            },
            {
                name: 'soul',
                dimensions: {
                    top: 0,
                    left: 0
                },
                subgenres: []
            }
        ];

        const getDimensions = (dimensions) => {
            const regexpCoordinates = /\d/g;
            return [parseInt(dimensions[1].match(regexpCoordinates).join('')), parseInt(dimensions[2].match(regexpCoordinates).join(''))];
        }

        const getDistance = (top, left, genre) => {
            return Math.sqrt(Math.pow(top - genre.dimensions.top, 2) + Math.pow(left - genre.dimensions.left, 2));
        }

        genres.forEach(genre => {
            [genre.dimensions.top, genre.dimensions.left] = getDimensions(
                document.querySelector(`[href='engenremap-${genre.name}.html']`).parentNode.getAttribute('style').split("; ")
            );
        });
        
        const numGenres = document.querySelector(".canvas").children.length;
        // For each genre from the website, match it to the closest "main" genre as based on the study in README.md
        for (let i = 1; i <= numGenres; i++) {
            const genre = document.querySelector("#item" + i);
            [top, left] = getDimensions(genre.getAttribute('style').split("; "));

            let mainGenreIndex = 0,
                minDistance    = getDistance(top, left, genres[0]);
            for (let j = 0; j < genres.length; j++) {
                const distance = getDistance(top, left, genres[j]);
                if (distance < minDistance) {
                    minDistance = distance;
                    mainGenreIndex = j;
                }
            }

            genre.removeChild(genre.childNodes[1]);
            genres[mainGenreIndex].subgenres.push(genre.textContent.trim());
            if (i % 55 == 0) {
                job.progress(i / 55);
            }
            if (i == 5500) {
                console.log("has not been resolevd yet");
            }
        }
        return Promise.resolve(genres);
    } catch (err) {
        throw err;
    }
}

const getProbs = async () => {
    try {
        const { data } = await axios.get("https://www.16personalities.com/country-profiles/united-states");
        const { document } = new JSDOM(data).window;

        // Probability distributions for each genre taken from https://www.16personalities.com/articles/music-preferences-by-personality-type

        const probs = {
            traits: {
                extraverted: 0,
                observant: 0,
                feeling: 0,
                prospecting: 0,
                turbulent: 0
            },
            personality: {
                punk: {
                    extraverted: 40.19 / (40.19 + 44.47),
                    observant: 34.04 / (34.04 + 44.86),
                    feeling: 42.57 / (42.57 + 44.41),
                    prospecting: 47.78 / (47.78 + 37.01),
                    turbulent: 45.22 / (45.22 + 40.34)
                },
                jazz: {
                    extraverted: 59.36 / (59.36 + 50.94),
                    observant: 45.71 / (45.71 + 54.35),
                    feeling: 53.29 / (53.29 + 52.94),
                    prospecting: 54.48 / (54.48 + 51.22),
                    turbulent: 50.42 / (50.42 + 57.51)
                },
                classical: {
                    extraverted: 70.63 / (70.63 + 72.49),
                    observant: 61.46 / (61.46 + 73.71),
                    feeling: 70.43 / (70.43 + 74.13),
                    prospecting: 70.5 / (70.5 + 74.16),
                    turbulent: 69.9 / (69.9 + 75.38)
                },
                rock: {
                    extraverted: 76.69 / (76.69 + 78.87),
                    observant: 67.96 / (67.96 + 79.98),
                    feeling: 77.59 / (77.59 + 79.26),
                    prospecting: 80.96 / (80.96 + 74.48),
                    turbulent: 78.31 / (78.31 + 78.28)
                },
                alternativerock: {
                    extraverted: 80.5 / (80.5 + 81.49),
                    observant: 74.68 / (74.68 + 82.3),
                    feeling: 83.3 / (83.3 + 78.41),
                    prospecting: 83.63 / (83.63 + 77.78),
                    turbulent: 83.64 / (83.64 + 77.36)
                },
                reggae: {
                    extraverted: 36.91 / (36.91 + 28.37),
                    observant: 30.19 / (30.19 + 30.67),
                    feeling: 33.03 / (33.03 + 27.33),
                    prospecting: 32.64 / (32.64 + 27.68),
                    turbulent: 29.22 / (29.22 + 32.82)
                },
                ambient: {
                    extraverted: 57.48 / (57.48 + 54.85),
                    observant: 50.25 / (50.25 + 56.4),
                    feeling: 58.26 / (58.26 + 51.85),
                    prospecting: 58.02 / (58.02 + 51.97),
                    turbulent: 56.48 / (56.48 + 54.03)
                },
                world: {
                    extraverted: 44.99 / (44.99 + 41.58),
                    observant: 34.42 / (34.42 + 43.78),
                    feeling: 46.57 / (46.57 + 36.9),
                    prospecting: 43.36 / (43.36 + 41.19),
                    turbulent: 42.03 / (42.03 + 43.18)
                },
                pop: {
                    extraverted: 73.58 / (73.58 + 63.6),
                    observant: 72.95 / (72.95 + 65.11),
                    feeling: 72.79 / (72.79 + 57.26),
                    prospecting: 66.28 / (66.28 + 66.11),
                    turbulent: 69.57 / (69.57 + 60.83)
                },
                metal: {
                    extraverted: 30.73 / (30.73 + 39.32),
                    observant: 27.57 / (27.57 + 38.61),
                    feeling: 33.1 / (33.1 + 42.47),
                    prospecting: 40.53 / (40.53 + 32.12),
                    turbulent: 35.8 / (35.8 + 39.11)
                },
                hiphop: {
                    extraverted: 54.84 / (54.84 + 41.32),
                    observant: 43.41 / (43.41 + 45.11),
                    feeling: 45.76 / (45.76 + 43.66),
                    prospecting: 46.97 / (46.97 + 41.84),
                    turbulent: 44.16 / (44.16 + 46.01)
                },
                electronica: {
                    extraverted: 70.75 / (70.75 + 61.32),
                    observant: 60.48 / (60.48 + 64.33),
                    feeling: 65.47 / (65.47 + 61.5),
                    prospecting: 65.92 / (65.92 + 60.71),
                    turbulent: 64.1 / (64.1 + 63.28)
                },
                chantreligieux: {
                    extraverted: 33.94 / (33.94 + 28.33),
                    observant: 34.47 / (34.47 + 29.04),
                    feeling: 34.58 / (34.58 + 23.3),
                    prospecting: 27.86 / (27.86 + 32.59),
                    turbulent: 29.54 / (29.54 + 30.22)
                },
                blues: {
                    extraverted: 48.83 / (48.83 + 41.43),
                    observant: 35.99 / (35.99 + 44.57),
                    feeling: 44.97 / (44.97 + 41.21),
                    prospecting: 44.84 / (44.84 + 41.26),
                    turbulent: 40.84 / (40.84 + 47.45)
                },
                country: {
                    extraverted: 39.13 / (39.13 + 32.22),
                    observant: 41.03 / (41.03 + 32.89),
                    feeling: 37.89 / (37.89 + 28.79),
                    prospecting: 33.67 / (33.67 + 34.55),
                    turbulent: 32.87 / (32.87 + 35.9)
                },
                soul: {
                    extraverted: 53.74 / (53.74 + 41.5),
                    observant: 45.44 / (45.44 + 44.59),
                    feeling: 50.22 / (50.22 + 37.25),
                    prospecting: 45.83 / (45.83 + 43.09),
                    turbulent: 44.9 / (44.9 + 44.39)
                }
            }
        }        

        distribution = JSON.parse(document.querySelector("#country-traits-comp").getAttribute('v-bind:world-data'));
        [
            probs.traits.extraverted, 
            probs.traits.observant, 
            probs.traits.feeling, 
            probs.traits.prospecting, 
            probs.traits.turbulent
        ] = distribution.map(trait => trait / 100);
        return Promise.resolve(probs);
    } catch (err) {
        throw err;
    }
}