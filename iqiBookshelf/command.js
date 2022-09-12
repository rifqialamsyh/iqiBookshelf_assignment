const theBooks = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {
  const submitBook = document.getElementById('inputBook');
  submitBook.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageAvailable()) {
    upBookListFromStorage();
  }
});

function generateId() {
  return +new Date();
}

function addBook() {
  const titleBook = document.getElementById('inputBookTitle').value;
  const theAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = document.getElementById('inputBookYear').value;
  const isBookDone = document.getElementById('inputBookIsComplete').checked;

  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID,
    titleBook,
    theAuthor,
    bookYear,
    isBookDone
  );
  theBooks.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBookData();
}

function generateBookObject(id, title, author, year, isBookDone) {
  return {
    id,
    title,
    author,
    year,
    isBookDone
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedReadList = document.getElementById(
    'incompleteBookshelfList'
  );
  uncompletedReadList.innerHTML = '';

  const completedReadList = document.getElementById('completeBookshelfList');
  completedReadList.innerHTML = '';

  for (const listBook of theBooks) {
    const bookElement = makeBookReadList(listBook);
    if (!listBook.isBookDone) uncompletedReadList.append(bookElement);
    else completedReadList.append(bookElement);
  }
});

function makeBookReadList(bookObject) {
  const bookTitle = document.createElement('h3');
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = bookObject.author;

  const yearOfBook = document.createElement('p');
  yearOfBook.innerText = bookObject.year;

  const firstButton = document.createElement('button');
  firstButton.classList.add('green');

  const secondButton = document.createElement('button');
  secondButton.classList.add('red');

  const buttonGrup = document.createElement('div');
  buttonGrup.classList.add('action');
  buttonGrup.append(firstButton, secondButton);

  const container = document.createElement('article');
  container.classList.add('book_item');
  container.append(bookTitle, bookAuthor, yearOfBook, buttonGrup);
  container.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isBookDone) {
    firstButton.innerText = 'Belum selesai dibaca';
    firstButton.addEventListener('click', function () {
      revokeReadListFromCompleted(bookObject.id);
    });

    secondButton.innerText = 'Hapus Buku';
    secondButton.addEventListener('click', function () {
      deleteFromReadList(bookObject.id);
    });
  } else {
    firstButton.innerText = 'Selesai Dibaca';
    firstButton.addEventListener('click', function () {
      addBookToCompleted(bookObject.id);
    });

    secondButton.innerText = 'Hapus Buku';
    secondButton.addEventListener('click', function () {
      deleteFromReadList(bookObject.id);
    });
  }

  return container;
}

function addBookToCompleted(bookId) {
  const bookTarget = discoverBOOK(bookId);

  if (bookTarget == null) return;

  bookTarget.isBookDone = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBookData();
}

function discoverBOOK(bookId) {
  for (const bookItem of theBooks) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function deleteFromReadList(bookId) {
  if (confirm('Anda yakin ingin menghapus buku ini dari daftar?') == true) {
    const bookTarget = discoverBookIndex(bookId);

    if (bookTarget === -1) return;

    theBooks.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookData();
  }
}

function discoverBookIndex(bookId) {
  for (const index in theBooks) {
    if (theBooks[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function revokeReadListFromCompleted(bookId) {
  const bookTarget = discoverBOOK(bookId);

  if (bookTarget == null) return;

  bookTarget.isBookDone = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBookData();
}

function saveBookData() {
  if (isStorageAvailable()) {
    const parse = JSON.stringify(theBooks);
    localStorage.setItem(STORAGE_KEY, parse);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageAvailable() {
  if (typeof Storage === 'undefined') {
    alert(
      'Browser yang sedang digunakan saat ini tidak mendukung fitur local storage!'
    );
    return false;
  }
  return true;
}

const SAVED_EVENT = 'saved-bookList';
const STORAGE_KEY = 'iqiBookShelf';

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function upBookListFromStorage() {
  const serializedBookList = localStorage.getItem(STORAGE_KEY);
  let bookData = JSON.parse(serializedBookList);

  if (bookData !== null) {
    for (const book of bookData) {
      theBooks.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document
  .getElementById('searchBook')
  .addEventListener('submit', function (event) {
    event.preventDefault();

    findBook();
  });

function findBook() {
  const getBookListFromData = document.querySelectorAll('.book_item');

  const findBookFromList = document.getElementById('searchBookTitle').value;

  for (let theBOOK of getBookListFromData) {
    if (
      theBOOK.innerText.toUpperCase().includes(findBookFromList.toUpperCase())
    ) {
      theBOOK.style.display = 'block';
    } else {
      theBOOK.style.display = 'none';
    }
  }
}
