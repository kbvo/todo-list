export default class Todo {
    constructor(title, dueDate, priority, ) {
        this.title = title;
        this.dueDate = this.validateDate(dueDate);
        this.priority = priority;
        this.completed = false;
    }

    validateDate(date) {
        const [year, month, day] = date.split('-').map(Number);
        const parsedDate = new Date(year, month - 1, day);
        if (isNaN(parsedDate)) {
            throw new Error('Invalid date. Could not parse into a valid Date object.');
        }
        return parsedDate;
    }
}