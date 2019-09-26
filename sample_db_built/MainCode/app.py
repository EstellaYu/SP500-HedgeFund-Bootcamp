import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy


#data_filename = "../DataSets/S&P500.sqlite"
engine = create_engine("sqlite:///DataSets/S&P500.sqlite")

# reflect an existing database into a new model
Base = automap_base()

Base.prepare(engine, reflect=True)

# Save references to each table
Threebars = Base.classes.threebars
Fivelines = Base.classes.fivelines
Sampledata = Base.classes.sampledata
Threedchart = Base.classes.threedchart

#################################################
# Flask Setup
#################################################

app = Flask(__name__)


@app.route("/")
def index():
    
    """Return the homepage."""
#    return render_template("index.html")
    return "Welcome"



def tickers():
    """Return a list of tickers"""


    # Get the unique list of tickers
    session = Session(engine)
    results = session.query(Sampledata.ticker).distinct().all()
    
    tickers = list(np.ravel(results))

    # Sort alphabetically
    tickers.sort()

    return jsonify(tickers)


    

if __name__ == "__main__":
    app.run()
