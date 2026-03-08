
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OnChainPetition {

    // ──────────────────────────── Types ────────────────────────────

    enum Status { Active, Closed }

    struct Petition {
        uint256 id;
        address creator;
        string title;
        string description;
        string imageUrl;
        uint256 targetGoal;
        uint256 deadline;
        uint256 signatureCount;
        Status status;
        uint256 createdAt;
    }

    // ──────────────────────────── State ────────────────────────────

    address public owner;
    uint256 public creationFee;
    uint256 private _nextPetitionId;

    mapping(uint256 => Petition) public petitions;
    mapping(uint256 => mapping(address => bool)) public hasSigned;
    mapping(uint256 => address[]) public signers;
    mapping(address => uint256[]) public creatorPetitions;

    // ──────────────────────────── Events ────────────────────────────

    event PetitionCreated(
        uint256 indexed petitionId,
        address indexed creator,
        string title,
        uint256 targetGoal,
        uint256 deadline,
        uint256 createdAt
    );

    event PetitionSigned(
        uint256 indexed petitionId,
        address indexed signer,
        uint256 signatureCount
    );

    event PetitionClosed(
        uint256 indexed petitionId,
        address indexed closedBy
    );

    event PetitionUpdated(
        uint256 indexed petitionId,
        address indexed updatedBy
    );

    event CreationFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    event TokenRecovered(
        address indexed token,
        address indexed to,
        uint256 amount
    );

    // ──────────────────────────── Errors ────────────────────────────

    error PetitionDoesNotExist(uint256 petitionId);
    error PetitionNotActive(uint256 petitionId);
    error PetitionExpired(uint256 petitionId);
    error AlreadySigned(uint256 petitionId, address signer);
    error NotPetitionCreator(uint256 petitionId, address caller);
    error TitleRequired();
    error NothingToUpdate();
    error NotOwner();
    error InvalidOwner();
    error InsufficientCreationFee(uint256 required, uint256 sent);
    error WithdrawFailed();
    error NothingToWithdraw();
    error TransferFailed();

    // ──────────────────────────── Constructor ────────────────────────────

    /// @notice Deploy the contract with an initial creation fee (set to 0 for free)
    /// @param _creationFee The ETH amount (in wei) required to create a petition
    constructor(uint256 _creationFee) {
        owner = msg.sender;
        creationFee = _creationFee;
    }

    // ──────────────────────────── Modifiers ────────────────────────────

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier petitionExists(uint256 petitionId) {
        if (petitionId >= _nextPetitionId) revert PetitionDoesNotExist(petitionId);
        _;
    }

    modifier petitionActive(uint256 petitionId) {
        if (petitions[petitionId].status != Status.Active) revert PetitionNotActive(petitionId);
        if (petitions[petitionId].deadline != 0 && block.timestamp > petitions[petitionId].deadline)
            revert PetitionExpired(petitionId);
        _;
    }

    modifier onlyCreator(uint256 petitionId) {
        if (petitions[petitionId].creator != msg.sender)
            revert NotPetitionCreator(petitionId, msg.sender);
        _;
    }

    // ──────────────────────────── Owner Functions ────────────────────────────

    /// @notice Update the ETH fee required to create a petition (set to 0 for free)
    function setCreationFee(uint256 _fee) external onlyOwner {
        uint256 oldFee = creationFee;
        creationFee = _fee;
        emit CreationFeeUpdated(oldFee, _fee);
    }

    /// @notice Withdraw all ETH from the contract to the owner
    function withdrawAll() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NothingToWithdraw();

        (bool success, ) = owner.call{value: balance}("");
        if (!success) revert WithdrawFailed();
    }

    /// @notice Transfer contract ownership to a new address
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0) || newOwner == owner) revert InvalidOwner();
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /// @notice Recover accidentally sent ERC20 tokens
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        // Use low-level call to support non-standard ERC20s (e.g. USDT)
        (bool success, bytes memory data) = tokenAddress.call(
            abi.encodeWithSignature("transfer(address,uint256)", owner, tokenAmount)
        );
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) {
            revert TransferFailed();
        }
        emit TokenRecovered(tokenAddress, owner, tokenAmount);
    }

    // ──────────────────────────── Write Functions ────────────────────────────

    /// @notice Create a new petition (requires ETH fee if creationFee > 0)
    function createPetition(
        string calldata _title,
        string calldata _description,
        string calldata _imageUrl,
        uint256 _targetGoal,
        uint256 _deadline
    ) external payable returns (uint256 petitionId) {
        if (bytes(_title).length == 0) revert TitleRequired();
        if (creationFee > 0 && msg.value != creationFee)
            revert InsufficientCreationFee(creationFee, msg.value);

        petitionId = _nextPetitionId++;

        petitions[petitionId] = Petition({
            id: petitionId,
            creator: msg.sender,
            title: _title,
            description: _description,
            imageUrl: _imageUrl,
            targetGoal: _targetGoal,
            deadline: _deadline,
            signatureCount: 0,
            status: Status.Active,
            createdAt: block.timestamp
        });

        creatorPetitions[msg.sender].push(petitionId);

        emit PetitionCreated(petitionId, msg.sender, _title, _targetGoal, _deadline, block.timestamp);
    }

    /// @notice Update a petition (only creator)
    function updatePetition(
        uint256 _petitionId,
        uint256 _targetGoal,
        uint256 _deadline
    )
        external
        petitionExists(_petitionId)
        petitionActive(_petitionId)
        onlyCreator(_petitionId)
    {
        Petition storage p = petitions[_petitionId];

        bool updated = false;

        if (_targetGoal != 0) {
            p.targetGoal = _targetGoal;
            updated = true;
        }
        if (_deadline != 0) {
            p.deadline = _deadline;
            updated = true;
        }

        if (!updated) revert NothingToUpdate();

        emit PetitionUpdated(_petitionId, msg.sender);
    }

    /// @notice Sign an existing petition
    function signPetition(uint256 _petitionId)
        external
        petitionExists(_petitionId)
        petitionActive(_petitionId)
    {
        if (hasSigned[_petitionId][msg.sender]) revert AlreadySigned(_petitionId, msg.sender);

        hasSigned[_petitionId][msg.sender] = true;
        signers[_petitionId].push(msg.sender);
        petitions[_petitionId].signatureCount++;

        emit PetitionSigned(_petitionId, msg.sender, petitions[_petitionId].signatureCount);
    }

    /// @notice Close a petition (only creator)
    function closePetition(uint256 _petitionId)
        external
        petitionExists(_petitionId)
        onlyCreator(_petitionId)
    {
        petitions[_petitionId].status = Status.Closed;
        emit PetitionClosed(_petitionId, msg.sender);
    }

    // ──────────────────────────── View Functions ────────────────────────────

    /// @notice Get the current creation fee
    function getCreationFee() external view returns (uint256) {
        return creationFee;
    }

    /// @notice Get full petition details
    function getPetition(uint256 _petitionId)
        external view petitionExists(_petitionId)
        returns (Petition memory)
    {
        return petitions[_petitionId];
    }

    /// @notice Get all petitions created by the caller (full details)
    function getMyPetitions() external view returns (Petition[] memory) {
        uint256[] memory ids = creatorPetitions[msg.sender];
        Petition[] memory result = new Petition[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = petitions[ids[i]];
        }
        return result;
    }

    /// @notice Get all petition IDs created by any address
    function getPetitionsByCreator(address _creator)
        external view returns (uint256[] memory)
    {
        return creatorPetitions[_creator];
    }

    /// @notice Get all signers of a petition
    function getSigners(uint256 _petitionId)
        external view petitionExists(_petitionId)
        returns (address[] memory)
    {
        return signers[_petitionId];
    }

    /// @notice Get a slice of signers (for pagination)
    function getSignersPaginated(uint256 _petitionId, uint256 _offset, uint256 _limit)
        external
        view
        petitionExists(_petitionId)
        returns (address[] memory)
    {
        uint256 totalSigners = signers[_petitionId].length;
        if (_offset >= totalSigners) return new address[](0);

        uint256 end = _offset + _limit;
        if (end > totalSigners) end = totalSigners;

        uint256 size = end - _offset;
        address[] memory result = new address[](size);
        for (uint256 i = 0; i < size; i++) {
            result[i] = signers[_petitionId][_offset + i];
        }
        return result;
    }

    /// @notice Get signature count
    function getSignatureCount(uint256 _petitionId)
        external view petitionExists(_petitionId)
        returns (uint256)
    {
        return petitions[_petitionId].signatureCount;
    }

    /// @notice Check if an address has signed
    function hasAddressSigned(uint256 _petitionId, address _signer)
        external view petitionExists(_petitionId)
        returns (bool)
    {
        return hasSigned[_petitionId][_signer];
    }

    /// @notice Get total petitions count
    function getTotalPetitions() external view returns (uint256) {
        return _nextPetitionId;
    }

    /// @notice Get a slice of petitions (for pagination)
    function getPetitionsPaginated(uint256 _offset, uint256 _limit)
        external
        view
        returns (Petition[] memory)
    {
        if (_offset >= _nextPetitionId) return new Petition[](0);

        uint256 end = _offset + _limit;
        if (end > _nextPetitionId) end = _nextPetitionId;

        uint256 size = end - _offset;
        Petition[] memory result = new Petition[](size);
        for (uint256 i = 0; i < size; i++) {
            result[i] = petitions[_offset + i];
        }
        return result;
    }

    /// @notice Check if petition is still active
    function isPetitionActive(uint256 _petitionId)
        external view petitionExists(_petitionId)
        returns (bool)
    {
        Petition memory p = petitions[_petitionId];
        if (p.status != Status.Active) return false;
        if (p.deadline != 0 && block.timestamp > p.deadline) return false;
        return true;
    }
}
