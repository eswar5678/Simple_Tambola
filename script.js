'use strict';

const rowRange = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const $tickets = document.querySelector('.tickets');
const $hostNumbers = document.querySelector('.host-numbers');
const $calledNumberDisplay = document.getElementById('calledNumberDisplay');
const calledNumbers = new Set();
const maxTicketCount = 2;

document.getElementById('ticketCount').addEventListener('input', ({target}) => {
    target.setCustomValidity('');

    let count = Number(target.value);

    if (!count || !Number.isFinite(count) || count > maxTicketCount) {
        target.setCustomValidity(`Enter a value between 1 and ${maxTicketCount}`);
        target.reportValidity();
        return;
    }

    const tickets = [];

    for (let i = 1; i <= count; ++i) {
        const div = document.createElement('div');
        div.classList.add('ticket');

        const title = document.createElement('h3');
        title.textContent = `Ticket Number: ${i}`;
        div.appendChild(title);

        div.appendChild(generateTicket());

        tickets.push(div);
    }

    $tickets.innerHTML = '';
    $tickets.append(...tickets);
});

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function cell(content) {
    const el = document.createElement('div');
    el.classList.add('number');
    el.textContent = content;

    // Add click event listener
    el.addEventListener('click', () => {
        if (calledNumbers.has(Number(el.textContent))) {
            el.classList.toggle('clicked');
        }
    });

    return el;
}

function generateShuffledColumn(columnNumber) {
    const range = Array.from({ length: columnNumber < 8 ? 9 : 10 }, (_, i) => (columnNumber * 10) + i + 1);
    const column = shuffle(range).slice(0, 3).sort();

    return column;
}

function generateTicket() {
    const tambola = document.createElement('div');
    tambola.classList.add('tambola');
    const numbers = [];
    const rows = Array.from({ length: 3 }, _ => shuffle(rowRange.slice(0)).slice(0, 5)).map(r => r.sort());
    const columns = Array.from({ length: 9 }, (_, i) => generateShuffledColumn(i));

    let i = 0;
    const absentColumns = [];
    const allColumns = rows.slice(0, 2).flat();
    rowRange.forEach(c => {
        if (allColumns.includes(c) === false) {
            absentColumns.push(c);
        }
    });

    rows[2].unshift(...absentColumns);
    rows[2] = rows[2].filter((n, i) => rows[2].indexOf(n) === i).slice(0, 5).sort();

    for (let r = 0; r < 3; ++r) {
        for (let c = 1; c <= 9; ++c) {
            const content = rows[r].includes(c) ? columns[c - 1].shift() : '';
            const numberCell = cell(content);
            if (content) numberCell.dataset.number = content; // Store the number in the dataset
            numbers[i] = numberCell;
            ++i;
        }
    }
    tambola.append(...numbers);

    return tambola;
}

function generateHostNumbers() {
    for (let i = 1; i <= 90; i++) {
        const numberEl = document.createElement('div');
        numberEl.classList.add('host-number');
        numberEl.textContent = i;
        numberEl.addEventListener('click', () => {
            numberEl.classList.toggle('selected');
        });
        $hostNumbers.appendChild(numberEl);
    }
}

function callRandomNumber() {
    const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !calledNumbers.has(n));
    if (remainingNumbers.length === 0) {
        alert("All numbers have been called!");
        return;
    }
    const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
    const randomNumber = remainingNumbers[randomIndex];
    calledNumbers.add(randomNumber);
    const numberEl = $hostNumbers.children[randomNumber - 1];
    numberEl.classList.add('selected');
    $calledNumberDisplay.textContent = `Called Number: ${randomNumber}`;

    // Blink if the number is present in the ticket
    const ticketCells = document.querySelectorAll('.number');
    ticketCells.forEach(cell => {
        if (cell.textContent === String(randomNumber)) {
            cell.classList.add('blink');
            setTimeout(() => {
                cell.classList.remove('blink');
            }, 3000); // Line number to modify the blink time
        }
    });
}

document.getElementById('callNumber').addEventListener('click', callRandomNumber);

document.getElementById('toggleHostNumbers').addEventListener('click', () => {
    $hostNumbers.classList.toggle('visible');
    if ($hostNumbers.classList.contains('visible')) {
        document.getElementById('toggleHostNumbers').textContent = 'Hide Host Numbers Grid';
    } else {
        document.getElementById('toggleHostNumbers').textContent = 'Show Host Numbers Grid';
    }
});

// Generate host numbers on page load
generateHostNumbers();

// Trigger input event on load to generate default tickets
const event = new KeyboardEvent('input', {bubbles: true, cancelable: true});
document.getElementById('ticketCount').dispatchEvent(event);
