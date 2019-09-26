import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify, render_template

#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///data/CompanyData.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
MasterData = Base.classes.MasterData
QuintileMonthlyData = Base.classes.QuintileMonthlyData
QuintileAvgData = Base.classes.QuintileAvgData

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    # return Homepage
    return render_template("index.html")
    # """List all available api routes."""
    # Available links
    # f"Available Routes:<br/>"
    # f"/FiveLines/criteria/sector <br/>"
    # f"/BarChart/quintile/sector <br/>"
    # f"/ThreeDee/sector <br/>"
    # f"/CompanyData/ticker/criteria <br/>"
    # f"/CriteriaList <br/>"
    # f"/TickerList <br/>"
    # f"/SectorList <br/>"

def criteria_abbrev(criteria_dbname):
    if (criteria_dbname == "price_earnings"):
        criteria = "1 P-E"
    elif (criteria_dbname == "price_book"):
        criteria = "2 P-B"
    elif (criteria_dbname == "market_cap"):
        criteria = "6 Mkt Cap"
    elif (criteria_dbname == "net_debt_capital"):
        criteria = "5 Debt-Cap"
    elif (criteria_dbname == "ev_revenue"):
        criteria = "3 EV-Sales"
    elif (criteria_dbname == "ev_ebit"):
        criteria = "4 EV-EBIT"
    return criteria

def reverse_criteria(given_criteria):
    if (given_criteria == "1 P-E"):
        criteria = "price_earnings"
    elif (given_criteria == "2 P-B"):
        criteria = "price_earnings"
    elif (given_criteria == "6 Mkt Cap"):
        criteria = "market_cap"
    elif (given_criteria == "5 Debt-Cap"):
        criteria = "net_debt_capital"
    elif (given_criteria == "3 EV-Sales"):
        criteria = "ev_revenue"
    elif (given_criteria == "4 EV-EBIT"):
        criteria = "ev_ebit"
    return criteria

@app.route("/fig1")
def fig1():
    return render_template("fig1.html")

@app.route("/fig2")
def fig2():
    return render_template("fig2.html")
    
@app.route("/fig3")
def fig3():
    return render_template("fig3.html")

@app.route("/CriteriaList")
def CriteriaList():
    """Return a list of all criteria"""
    # Get the unique list of criteria names
    session = Session(engine)
    results = session.query(QuintileAvgData.criteria).distinct().all()

    # Convert list of tuples into normal list, then run them through a name conversion
    all_criteria = list(np.ravel(results))
    all_items = [criteria_abbrev(x) for x in all_criteria]

    # Sort alphabetically
    all_items.sort()

    return jsonify(all_items)

@app.route("/SectorList")
def SectorList():
    """Return a list of all sectors"""
    # Get the unique list of sectors
    session = Session(engine)
    results = session.query(QuintileAvgData.sector).distinct().all()

    # Convert list of tuples into normal list, then run them through a name conversion
    all_sectors = list(np.ravel(results))

    # Sort alphabetically
    all_sectors.sort()

    return jsonify(all_sectors)

@app.route("/TickerList")
def TickerList():
    """Return a list of all tickers"""
    # Get the unique list of tickers
    session = Session(engine)
    results = session.query(MasterData.ticker).distinct().all()

    # Convert list of tuples into normal list, then run them through a name conversion
    all_tickers = list(np.ravel(results))

    # Sort alphabetically
    all_tickers.sort()

    return jsonify(all_tickers)

@app.route("/FiveLines/<selected_criteria>/<selected_sector>")
def FiveLines(selected_criteria, selected_sector):
    """Return a list of the data requested"""

    session = Session(engine)
    real_criteria = reverse_criteria(selected_criteria)
    results = session.query(QuintileMonthlyData).filter_by(criteria=real_criteria).filter_by(sector=selected_sector).all()

    # Create a dictionary from the row data and append to a list of all_rows
    all_rows = []
    for result in results:
        data_dict = {}
        data_dict["monthend_date"] = result.monthend_date.strftime("%Y-%m-%d")
        data_dict["quintile"] = result.quintile
        data_dict["wealth_index"] = result.wealth_index
        all_rows.append(data_dict)

    return jsonify(all_rows)

@app.route("/BarChart/<selected_quintile>/<selected_sector>")
def BarChart(selected_quintile, selected_sector):
    """Return a list of the data requested"""

    session = Session(engine)
    results = session.query(QuintileAvgData).filter_by(quintile=selected_quintile).filter_by(sector=selected_sector).all()

    # Create a dictionary from the row data and append to a list of all_rows
    all_rows = []
    for result in results:
        data_dict = {}
        data_dict["criteria"] = criteria_abbrev (result.criteria)
        data_dict["total_return"] = result.port_return
        all_rows.append(data_dict)

    # Sort the dictionaries by the value of "criteria"
    all_rows = sorted(all_rows, key = lambda i: i['criteria']) 
    return jsonify(all_rows)

@app.route("/ThreeDee/<selected_sector>")
def ThreeDee(selected_sector):
    """Return a list of the data requested"""

    session = Session(engine)
    results = session.query(QuintileAvgData).filter_by(sector=selected_sector).all()

    # Create a dictionary from the row data and append to a list of all_rows
    all_rows = []
    for result in results:
        data_dict = {}
        data_dict["criteria"] = criteria_abbrev (result.criteria)
        data_dict["quintile"] = result.quintile
        data_dict["total_return"] = result.port_return
        all_rows.append(data_dict)

    # Sort the dictionaries by the value of "criteria"
    all_rows = sorted(all_rows, key = lambda i: i['criteria']) 
    return jsonify(all_rows)

@app.route("/CompanyData/<selected_ticker>/<selected_criteria>")
def CompanyData(selected_ticker, selected_criteria):
    """Return a list of the data requested"""

    session = Session(engine)
    results = session.query(MasterData).filter_by(ticker=selected_ticker).all()

    # Create a dictionary from the row data and append to a list of all_rows
    all_rows = []
    for result in results:
        data_dict = {}
        data_dict["monthend_date"] = result.monthend_date.strftime("%Y-%m-%d")

        real_criteria = reverse_criteria(selected_criteria)
        if (real_criteria == "price_earnings"):
            item_value = result.price_earnings
        elif (real_criteria == "price_book"):
            item_value = result.price_book
        elif (real_criteria == "market_cap"):
            item_value = result.market_cap
        elif (real_criteria == "net_debt_capital"):
            item_value = result.net_debt_capital
        elif (real_criteria == "ev_revenue"):
            item_value = result.ev_revenue
        elif (real_criteria == "ev_ebit"):
            item_value = result.ev_ebit

        data_dict["item_value"] = item_value
        all_rows.append(data_dict)

    # Sort the dictionaries by the value of "criteria"
    return jsonify(all_rows)


if __name__ == '__main__':
    app.run(debug=True)
