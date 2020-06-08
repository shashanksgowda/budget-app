//Budget Controller
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    Expense.prototype.calcPercentage = function(totalIncome) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    }

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function (type, desc, value) {
            var id = new Date().getTime();
            id = id + '' + Math.floor(Math.random() * 10);
            var newItem;
            if (type === 'exp') {
                newItem = new Expense(id, desc, value);
            } else if (type === 'inc') {
                newItem = new Income(id, desc, value);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            //console.log('index to be deleted' + index);
            data.allItems[type].splice(index, 1);
        },
        
        
        calculateBudget: function() {
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }            
            
            // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
        },
        
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc);
            });
        },
        
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
    }
})();

//UI Controller
var UIContoller = (function () {
    var DomStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',//Event delegation
        itemPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i ++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DomStrings.inputType).value,
                description: document.querySelector(DomStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DomStrings.inputValue).value)
            };
        },
        getDoms: function () {
            return DomStrings;
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DomStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DomStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DomStrings.inputDescription + ', ' + DomStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        deleteListItem: function (selectorID) {
            console.log(selectorID);
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayBudget: function(obj) {
            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget);
            document.querySelector(DomStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DomStrings.expenseLabel).textContent = obj.totalExp;
            
            if (obj.percentage > 0) {
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DomStrings.percentageLabel).textContent = '---';
            }
        },

        displayItemPercentage: function(percentages) {
            var fields = document.querySelectorAll(DomStrings.itemPercentage);

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayDate : function() {
            var now, year, month, months;
            months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'Decemeber'
            ]
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType : function() {
            var fields = document.querySelectorAll(
                DomStrings.inputType + ',' +
                DomStrings.inputDescription + ',' +
                DomStrings.inputValue
            );

            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });

            document.querySelector(DomStrings.addButton).classList.toggle('red');
        }
    };

})();

//Global App Controller
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        let dom = UICtrl.getDoms();
        document.querySelector(dom.addButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode == 13 || event.which == 13) {
                ctrlAddItem();
            }
            //console.log(event);
        });
        document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(dom.inputType).addEventListener('change', UICtrl.changedType);

    }

    var updateBudget = function() {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var ctrlAddItem = function () {

        var formValues,
            //Read Input
            formValues = UICtrl.getInput();

        if (formValues.description !== '' && !isNaN(formValues.value) && formValues.value > 0) {
            //Add Item to budget Controller
            var newItem = budgetCtrl.addItem(formValues.type, formValues.description, formValues.value);
            //Display on UI

            UICtrl.addListItem(newItem, formValues.type);

            //remove elements from the form fields
            UICtrl.clearFields();

            //Calculate Budget
            updateBudget();

            //Update percentage
            updatePercetages();
        }
    }

    var ctrlDeleteItem = function(event) {
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
        var itemId, splitItem, type, id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        splitItem = itemId.split("-");
        type = splitItem[0];
        id = splitItem[1]; 
        budgetCtrl.deleteItem(type , id);

        //remove the item from the list
        UICtrl.deleteListItem(itemId);

        //recalculate the budget
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();

        //display on UI
        UICtrl.displayBudget(budget);

        //Update percentage
        updatePercetages();
    }

    var updatePercetages = function() {
        //1. calculate percentages
        budgetCtrl.calculatePercentages();

        //2. Read percentages
        var percentage = budgetCtrl.getPercentages();

        //3. update on UI
        UICtrl.displayItemPercentage(percentage);

        console.log(percentage);

    }
    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UICtrl.displayDate()
            return setupEventListeners();
        }
    }
})(budgetController, UIContoller);

controller.init();
