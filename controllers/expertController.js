import Funding from '../models/Funding.js'
import ResearchProposal from '../models/ResearchProposal.js'
import RejectedProposals from '../models/RejectedProposals.js'
import User from '../models/User.js'
import Score from '../models/Score.js'
import Expert from '../models/Expert.js'

const verifyProposal = async (req, res) => {
    try {
        const research_proposal_cid = req.params.cid
        
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: 'Some Internal Server Error Occured.'
        })
    }
}